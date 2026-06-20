using System.Text.Json;
using KreatorQuiz.Api.DTOs.Ai;
using OpenAI;
using OpenAI.Chat;

namespace KreatorQuiz.Api.Services;

public class AiService(IConfiguration config)
{
    private readonly ChatClient _client = new(
        model: "gpt-4o-mini",
        apiKey: config["OpenAI:ApiKey"]!
    );

    private static string DifficultyLabel(string d) => d switch
    {
        "easy"        => "łatwy (proste fakty, podstawowa wiedza, pytania jednoznaczne)",
        "hard"        => "trudny (szczegółowe fakty, wyjątki, pytania wymagające głębokiej analizy)",
        "medium" or _ => "średni (zrozumienie tematu, zastosowanie wiedzy, umiarkowana złożoność)",
    };

    private static string TypeInstruction(string t) => t switch
    {
        "multiple"    => "Każde pytanie MUSI być wielokrotnego wyboru (type: \"multiple\") — więcej niż jedna opcja jest poprawna (ustaw correct: true dla 2–3 opcji).",
        "mixed"       => "Mieszaj typy: część pytań jednokrotnego wyboru (type: \"single\", dokładnie 1 correct: true), część wielokrotnego (type: \"multiple\", 2–3 correct: true). Decyduj sam która forma lepiej pasuje do danego pytania.",
        "single" or _ => "Każde pytanie MUSI być jednokrotnego wyboru (type: \"single\") — dokładnie jedna opcja jest poprawna (correct: true).",
    };

    private static readonly string JsonSchema = """
        {
          "questions": [
            {
              "text": "Treść pytania po polsku",
              "type": "single",
              "options": [
                {"label": "A", "text": "Opcja A", "correct": true},
                {"label": "B", "text": "Opcja B", "correct": false},
                {"label": "C", "text": "Opcja C", "correct": false},
                {"label": "D", "text": "Opcja D", "correct": false}
              ]
            }
          ]
        }
        """;

    public async Task<List<GeneratedQuestionDto>> GenerateAsync(string text, int count, string difficulty = "medium", string questionType = "single")
    {
        var systemMsg = new SystemChatMessage(
            "Jesteś ekspertem od tworzenia pytań quizowych edukacyjnych. " +
            "Generujesz pytania WYŁĄCZNIE w języku polskim. " +
            "Odpowiadasz WYŁĄCZNIE poprawnym JSON-em bez żadnego dodatkowego tekstu, komentarzy ani bloków kodu."
        );

        var userMsg = new UserChatMessage(
            $"Wygeneruj dokładnie {count} pytań quizowych na podstawie poniższego tekstu.\n\n" +
            $"POZIOM TRUDNOŚCI: {DifficultyLabel(difficulty)}\n" +
            $"TYP PYTAŃ: {TypeInstruction(questionType)}\n\n" +
            "WYMAGANIA JAKOŚCIOWE:\n" +
            "- Pytania muszą testować rozumienie, nie zapamiętywanie słów z tekstu\n" +
            "- Błędne odpowiedzi muszą być wiarygodne i pasować tematycznie\n" +
            "- Każde pytanie dotyczy innego aspektu tekstu\n" +
            "- Każda opcja to pełne zdanie lub wyrażenie (nie samo 'Tak'/'Nie')\n\n" +
            $"FORMAT ODPOWIEDZI (tylko ten JSON):\n{JsonSchema}\n\n" +
            $"TEKST ŹRÓDŁOWY:\n{text}"
        );

        var response = await _client.CompleteChatAsync([systemMsg, userMsg]);
        return ParseQuestions(response.Value.Content[0].Text);
    }

    public async Task<GeneratedQuestionDto?> RegenerateOneAsync(string originalQuestion, string difficulty = "medium", string questionType = "single", string? context = null)
    {
        var typeStr = questionType == "multiple" ? "multiple" : "single";

        var systemMsg = new SystemChatMessage(
            "Jesteś ekspertem od tworzenia pytań quizowych. " +
            "Generujesz WYŁĄCZNIE w języku polskim. " +
            "Odpowiadasz WYŁĄCZNIE poprawnym JSON-em."
        );

        var userMsg = new UserChatMessage(
            $"Wygeneruj 1 nowe pytanie quizowe na ten sam TEMAT co poniższe pytanie, ale inne sformułowanie i inne opcje.\n\n" +
            $"Oryginalne pytanie: \"{originalQuestion}\"\n" +
            (context != null ? $"Kontekst tematyczny: {context}\n" : "") +
            $"Poziom trudności: {DifficultyLabel(difficulty)}\n" +
            $"Typ: {TypeInstruction(questionType)}\n\n" +
            $"Odpowiedz TYLKO tym JSON-em:\n{JsonSchema}"
        );

        var response = await _client.CompleteChatAsync([systemMsg, userMsg]);
        var list = ParseQuestions(response.Value.Content[0].Text);
        return list.FirstOrDefault();
    }

    private static List<GeneratedQuestionDto> ParseQuestions(string raw)
    {
        var json = raw.Trim();
        if (json.StartsWith("```"))
            json = string.Join('\n', json.Split('\n').Skip(1).SkipLast(1));

        var labels = new[] { "A", "B", "C", "D" };

        using var doc = JsonDocument.Parse(json);

        // Support both {"questions":[...]} and bare [...]
        JsonElement arr;
        if (doc.RootElement.ValueKind == JsonValueKind.Array)
            arr = doc.RootElement;
        else
            arr = doc.RootElement.GetProperty("questions");

        return arr.EnumerateArray().Select(q =>
        {
            var options = q.GetProperty("options").EnumerateArray().Select(o => new GeneratedOptionDto(
                o.GetProperty("label").GetString()!,
                o.GetProperty("text").GetString()!,
                o.GetProperty("correct").GetBoolean()
            )).ToList();

            options = options.OrderBy(_ => Random.Shared.Next()).ToList();
            for (int i = 0; i < options.Count && i < labels.Length; i++)
                options[i] = options[i] with { Label = labels[i] };

            return new GeneratedQuestionDto(
                q.GetProperty("text").GetString()!,
                q.TryGetProperty("type", out var t) ? t.GetString()! : "single",
                options
            );
        }).ToList();
    }
}
