# KreatorQuiz

Platforma edukacyjna do tworzenia, udostępniania i rozwiązywania quizów w formacie ABCD. Projekt studencki AGH — Technologie Internetowe.

## Technologie

| Warstwa | Technologia |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS v3, React Router v6, Zustand, Axios |
| Backend | ASP.NET Core 10 Web API, Entity Framework Core 10 |
| Baza danych | PostgreSQL (Supabase) |
| Autoryzacja | JWT Bearer (BCrypt, 7-dniowe tokeny) |
| AI | OpenAI API |
| Ikony | Lucide React |
| Drag & Drop | @dnd-kit/core |

## Funkcjonalności

- Rejestracja i logowanie (JWT)
- Kreator quizów z pytaniami jednokrotnego wyboru, wielokrotnego wyboru i Prawda/Fałsz
- Asystent AI generujący pytania z tekstu lub plików PDF (do 5 plików)
- Katalog publicznych quizów
- Sesje quizowe w czasie rzeczywistym z kodem dołączania
- Ranking uczestników sesji
- Zmiana hasła i adresu email
- Dark / light mode z wykrywaniem preferencji systemowych
- Panel administracyjny (zarządzanie użytkownikami i quizami)
- Responsywny interfejs (RWD)

## Uruchomienie lokalne

### Wymagania

- [Node.js](https://nodejs.org/) 18+
- [.NET SDK](https://dotnet.microsoft.com/) 10
- Konto [Supabase](https://supabase.com/) (PostgreSQL) lub lokalna baza PostgreSQL
- Klucz API [OpenAI](https://platform.openai.com/) (dla funkcji AI)

---

### 1. Klonowanie repozytorium

```bash
git clone https://github.com/Snozlyy11/TechInt-projekt-AGH
cd TechInt-projekt-AGH
```

---

### 2. Backend

#### Konfiguracja

W katalogu `backend/` utwórz plik `appsettings.Development.json` (jest w `.gitignore` — nigdy nie trafia do repozytorium):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=...;Database=...;Username=...;Password=..."
  },
  "Jwt": {
    "Secret": "twoj-losowy-klucz-minimum-32-znaki",
    "Issuer": "KreatorQuiz",
    "Audience": "KreatorQuizUsers"
  },
  "OpenAI": {
    "ApiKey": "sk-..."
  }
}
```

#### Uruchomienie

```bash
cd backend
dotnet restore
dotnet run
```

API będzie dostępne pod adresem `http://localhost:5000`.

---

### 3. Frontend

#### Konfiguracja

W katalogu głównym projektu utwórz plik `.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

#### Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:5173`.

---

### 4. Konto administratora

Po uruchomieniu zarejestruj konto przez aplikację, następnie w panelu Supabase (Table Editor → Users) zmień pole `Role` z `user` na `admin`. Po ponownym zalogowaniu w menu profilu pojawi się **Panel administracyjny**.

## Struktura projektu

```
kreatorQuiz/
├── backend/                  # ASP.NET Core Web API
│   ├── Controllers/          # Endpointy REST
│   ├── Services/             # Logika biznesowa
│   ├── Models/               # Encje EF Core
│   ├── DTOs/                 # Obiekty transferu danych
│   ├── Data/                 # DbContext
│   └── Migrations/           # Migracje EF Core
├── src/                      # Frontend React
│   ├── components/
│   │   ├── layout/           # Navbar, ThemeToggle, ProtectedRoute
│   │   ├── quiz/             # QuizCard, QuestionEditor, AnswerOption
│   │   └── ui/               # Button, Badge, Input, RichTextEditor
│   ├── pages/                # Landing, Dashboard, Catalog, QuizCreator, ...
│   ├── services/             # Axios — authService, quizService, aiService, ...
│   ├── store/                # Zustand — authStore, themeStore, quizStore
│   └── hooks/                # useIsMobile, useSystemTheme
├── public/
├── .env.local                # Zmienne środowiskowe frontendu (nie w repo)
└── README.md
```

## Zmienne środowiskowe

| Plik | Zmienna | Opis |
|---|---|---|
| `.env.local` | `VITE_API_URL` | Adres backendu |
| `appsettings.Development.json` | `ConnectionStrings:DefaultConnection` | Connection string PostgreSQL |
| `appsettings.Development.json` | `Jwt:Secret` | Klucz podpisywania tokenów JWT |
| `appsettings.Development.json` | `OpenAI:ApiKey` | Klucz API OpenAI |

> **Ważne:** Pliki `.env.local` i `appsettings.Development.json` są w `.gitignore` i nigdy nie powinny trafiać do repozytorium.
