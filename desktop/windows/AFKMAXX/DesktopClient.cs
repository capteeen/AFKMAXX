using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;

namespace AFKMAXX;

static class DesktopClient
{
    public const string Origin = "http://localhost:4173";
    static readonly HttpClient http = new() { Timeout = TimeSpan.FromSeconds(8) };
    static readonly JsonSerializerOptions json = new() { PropertyNameCaseInsensitive = true };

    public static async Task<(string ticket, string loginUrl)?> StartLogin()
    {
        var req = new HttpRequestMessage(HttpMethod.Post, $"{Origin}/api/desktop/session");
        req.Content = new StringContent("{}", System.Text.Encoding.UTF8, "application/json");
        var res = await http.SendAsync(req);
        if (!res.IsSuccessStatusCode) return null;
        var body = await res.Content.ReadFromJsonAsync<StartBody>(json);
        if (body?.Ticket is null || body.LoginUrl is null) return null;
        return (body.Ticket, body.LoginUrl);
    }

    public static async Task<(string token, string email)?> Poll(string ticket)
    {
        var res = await http.GetAsync($"{Origin}/api/desktop/session?ticket={Uri.EscapeDataString(ticket)}");
        if (!res.IsSuccessStatusCode) return null;
        var body = await res.Content.ReadFromJsonAsync<StatusBody>(json);
        if (body?.Status != "ready" || body.Token is null || body.User?.Email is null) return null;
        return (body.Token, body.User.Email);
    }

    public static async Task<string?> Me(string token)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, $"{Origin}/api/me");
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        var res = await http.SendAsync(req);
        if (!res.IsSuccessStatusCode) return res.StatusCode == System.Net.HttpStatusCode.Unauthorized ? "" : null;
        var body = await res.Content.ReadFromJsonAsync<MeBody>(json);
        return body?.User?.Email;
    }

    record StartBody(string Ticket, string LoginUrl);
    record StatusBody(string Status, string? Token, UserBody? User);
    record MeBody(UserBody? User);
    record UserBody(string Id, string Email);
}
