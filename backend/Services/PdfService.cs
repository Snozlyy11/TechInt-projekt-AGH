using UglyToad.PdfPig;

namespace KreatorQuiz.Api.Services;

public class PdfService
{
    public string ExtractText(Stream stream)
    {
        using var pdf = PdfDocument.Open(stream);
        var pages = pdf.GetPages().Select(p => p.Text);
        return string.Join("\n", pages);
    }
}
