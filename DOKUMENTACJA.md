# Dokumentacja techniczna — KreatorQuiz

Projekt studencki AGH, Technologie Internetowe.

---

## 1. Architektura rozwiązania

KreatorQuiz to aplikacja webowa zbudowana w architekturze **klient–serwer**:

### Frontend (SPA)

Aplikacja jednostronicowa uruchamiana w przeglądarce. Komunikuje się z backendem wyłącznie przez REST API (JSON). Routing obsługiwany po stronie klienta przez React Router v6. Stan globalny zarządzany przez Zustand (auth, quiz, motyw).

### Backend (REST API)

ASP.NET Core 10 Web API. Każde żądanie jest bezstanowe — autoryzacja odbywa się przez token JWT przekazywany w nagłówku `Authorization: Bearer`. Logika biznesowa zamknięta w serwisach; kontrolery odpowiadają wyłącznie za routing HTTP i walidację.

### Baza danych

PostgreSQL hostowany na Supabase. Dostęp przez Entity Framework Core 10 (ORM) — migracje generowane przez EF CLI.

---

## 2. Struktura bazy danych

### Tabele

#### `Users`
| Kolumna | Typ | Opis |
|---|---|---|
| `Id` | int PK | Identyfikator |
| `Name` | varchar | Wyświetlana nazwa |
| `Email` | varchar UNIQUE | Adres email (login) |
| `PasswordHash` | varchar | Hash BCrypt |
| `Role` | varchar | `user` lub `admin` (domyślnie `user`) |
| `CreatedAt` | timestamp | Data rejestracji |

#### `Quizzes`
| Kolumna | Typ | Opis |
|---|---|---|
| `Id` | int PK | Identyfikator |
| `UserId` | int FK → Users | Właściciel |
| `Title` | varchar | Tytuł quizu |
| `Description` | varchar? | Opis (opcjonalny) |
| `TimeLimit` | int? | Limit czasu w minutach (null = brak) |
| `Published` | bool | Czy widoczny w katalogu |
| `BannerUrl` | text? | Obraz bannera (base64) |
| `CreatedAt` | timestamp | Data utworzenia |
| `UpdatedAt` | timestamp | Data ostatniej edycji |

#### `Questions`
| Kolumna | Typ | Opis |
|---|---|---|
| `Id` | int PK | Identyfikator |
| `QuizId` | int FK → Quizzes | Należy do quizu |
| `Text` | text | Treść pytania (HTML) |
| `Type` | varchar | `single`, `multiple`, `truefalse` |
| `Order` | int | Kolejność w quizie |
| `Points` | int | Punkty za poprawną odpowiedź (domyślnie 1) |
| `Required` | bool | Czy pytanie obowiązkowe |
| `ImageUrl` | text? | Zdjęcie przy pytaniu (base64) |

#### `Options`
| Kolumna | Typ | Opis |
|---|---|---|
| `Id` | int PK | Identyfikator |
| `QuestionId` | int FK → Questions | Należy do pytania |
| `Text` | varchar | Treść odpowiedzi |
| `IsCorrect` | bool | Czy poprawna |
| `Order` | int | Kolejność (A/B/C/D) |

#### `QuizSessions`
| Kolumna | Typ | Opis |
|---|---|---|
| `Id` | int PK | Identyfikator |
| `QuizId` | int FK → Quizzes | Quiz sesji |
| `HostUserId` | int FK → Users | Prowadzący |
| `Code` | varchar(6) UNIQUE | Kod dołączenia |
| `IsActive` | bool | Czy sesja aktywna |
| `CreatedAt` | timestamp | Data utworzenia |

#### `SessionParticipants`
| Kolumna | Typ | Opis |
|---|---|---|
| `Id` | int PK | Identyfikator |
| `SessionId` | int FK → QuizSessions | Sesja |
| `Name` | varchar | Imię uczestnika |
| `Score` | int | Uzyskane punkty |
| `Total` | int | Maksymalna liczba punktów |
| `FinishedAt` | timestamp | Czas ukończenia |

#### `QuizSubmissions`
| Kolumna | Typ | Opis |
|---|---|---|
| `Id` | int PK | Identyfikator |
| `QuizId` | int FK → Quizzes | Quiz |
| `UserId` | int? FK → Users | Użytkownik (null = gość) |
| `Score` | int | Uzyskane punkty |
| `Total` | int | Maksymalna liczba punktów |
| `SubmittedAt` | timestamp | Data rozwiązania |

### Relacje i kaskady

- Usunięcie `User` → kaskadowe usunięcie jego `Quizzes`, `QuizSessions`
- Usunięcie `Quiz` → kaskadowe usunięcie `Questions`, `Options`, `QuizSessions`, `QuizSubmissions`
- Usunięcie `Question` → kaskadowe usunięcie `Options`
- Usunięcie `QuizSession` → kaskadowe usunięcie `SessionParticipants`
- Usunięcie `User` przy `QuizSubmission` → `UserId` ustawiane na NULL (zachowanie historii)

---

## 3. Endpointy API

### Autentykacja — `/api/auth`

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| POST | `/auth/register` | — | Rejestracja nowego konta |
| POST | `/auth/login` | — | Logowanie, zwraca JWT + dane użytkownika |
| GET | `/auth/me` | ✓ | Dane zalogowanego użytkownika |
| PUT | `/auth/change-password` | ✓ | Zmiana hasła |
| PUT | `/auth/change-email` | ✓ | Zmiana adresu email |

### Quizy — `/api/quizzes`

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| GET | `/quizzes` | ✓ | Lista quizów zalogowanego użytkownika |
| GET | `/quizzes/public` | — | Katalog opublikowanych quizów |
| GET | `/quizzes/{id}` | — | Szczegóły quizu z pytaniami |
| POST | `/quizzes` | ✓ | Utwórz nowy quiz |
| PUT | `/quizzes/{id}` | ✓ | Aktualizuj quiz (właściciel lub admin) |
| DELETE | `/quizzes/{id}` | ✓ | Usuń quiz (właściciel) |
| POST | `/quizzes/{id}/copy` | ✓ | Skopiuj quiz do swojego konta |
| POST | `/quizzes/{id}/submit` | — | Prześlij odpowiedzi, zwraca wynik |
| POST | `/quizzes/{id}/questions/batch` | ✓ | Dodaj pytania zbiorczo (z AI) |

### Sesje — `/api/sessions`

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| POST | `/sessions` | ✓ | Utwórz sesję dla quizu |
| GET | `/sessions/{code}` | — | Dane sesji (quiz + uczestnicy) |
| DELETE | `/sessions/{code}` | ✓ | Zakończ sesję |
| POST | `/sessions/{code}/join` | — | Dołącz do sesji jako uczestnik |
| GET | `/sessions/{code}/results` | — | Ranking sesji |

### AI — `/api/ai`

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| POST | `/ai/generate` | ✓ | Generuj pytania z tekstu lub PDF |

### Admin — `/api/admin`

| Metoda | Ścieżka | Auth | Opis |
|---|---|---|---|
| GET | `/admin/users` | ✓ Admin | Lista wszystkich użytkowników z quizami |
| DELETE | `/admin/quizzes/{id}` | ✓ Admin | Usuń dowolny quiz |

---

## 4. Autoryzacja i bezpieczeństwo

- **JWT Bearer** — token wystawiany przy logowaniu, ważny 7 dni, zawiera: `Id`, `Email`, `Name`, `Role`
- **BCrypt** — hasła nigdy nie są przechowywane w postaci jawnej
- **Role** — `[Authorize(Roles = "admin")]` na endpointach administracyjnych
- **Własność zasobów** — endpointy quizów i sesji weryfikują, czy `UserId` w tokenie odpowiada właścicielowi zasobu
- **CORS** — skonfigurowany na potrzeby frontendu
- **Sekrety poza repozytorium** — `appsettings.Development.json` i `.env.local` są w `.gitignore`

---

## 5. Najważniejsze funkcjonalności

### Kreator quizów

Edytor quizów z podziałem na dwa panele (lista pytań / edytor pytania). Pytania obsługują trzy typy: jednokrotny wybór (`single`), wielokrotny wybór (`multiple`), Prawda/Fałsz (`truefalse`). Kolejność pytań zmieniana przez przeciąganie (biblioteka `@dnd-kit`). Treść pytania edytowana przez RichTextEditor (bold, italic, listy, wyrównanie). Każde pytanie może mieć zdjęcie. Quiz może mieć banner.

### Sesje quizowe

Prowadzący tworzy sesję — otrzymuje 6-znakowy kod. Uczestnicy wpisują kod na stronie `/join` bez rejestracji. Po dołączeniu widzą aktywne pytania w czasie rzeczywistym (polling). Po ukończeniu quizu uczestnik trafia do rankingu. Prowadzący jawnie zamyka sesję przyciskiem — sama nawigacja do wyników sesji jej nie kończy.

### Asystent AI

Użytkownik wkleja tekst lub przesyła do 5 plików PDF. Wysyłane są do OpenAI API wraz z promptem precyzującym format odpowiedzi (JSON). Wygenerowane pytania trafiają do podglądu, skąd można wybrać które dodać do istniejącego lub nowego quizu.

### Panel administracyjny

Dostępny pod `/admin` wyłącznie dla użytkowników z rolą `admin`. Wyświetla wszystkich użytkowników z listą ich quizów (liczbą pytań, statusem publikacji). Admin może edytować dowolny quiz przez istniejący kreator oraz usuwać quizy użytkowników.

### Dark / Light mode

Motyw wykrywany automatycznie z preferencji systemowych (`prefers-color-scheme`). Przechowywany w `localStorage`. Przełączany przyciskiem w lewym dolnym rogu. Implementacja przez klasę `dark` na `<html>` i CSS custom properties (`--bg`, `--fg`, `--bg-card`, `--border`, `--bg-muted`).

---

## 6. Stos technologiczny — szczegóły

### Frontend

| Biblioteka | Wersja | Zastosowanie |
|---|---|---|
| React | 18 | Biblioteka UI |
| Vite | 6 | Bundler i dev server |
| Tailwind CSS | 3 | Utility-first CSS |
| React Router | 6 | Routing SPA |
| Zustand | 5 | Stan globalny |
| Axios | 1 | HTTP client z interceptorami JWT |
| Lucide React | — | Ikony |
| @dnd-kit/core | — | Drag & drop |

### Backend

| Biblioteka | Wersja | Zastosowanie |
|---|---|---|
| ASP.NET Core | 10 | Web API framework |
| Entity Framework Core | 10 | ORM |
| Npgsql.EF | — | Driver PostgreSQL |
| BCrypt.Net | — | Haszowanie haseł |
| Microsoft.IdentityModel.Tokens | — | Generowanie JWT |
