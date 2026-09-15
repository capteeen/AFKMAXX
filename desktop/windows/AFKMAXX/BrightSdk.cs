using System.IO;
using System.Runtime.InteropServices;
using System.Text.Json;

namespace AFKMAXX;

enum BrightChoice
{
    None = 0,
    Peer = 1,
    NotPeer = 2
}

static class BrightSdk
{
    const string Dll = "lum_sdk64.dll";

    public static bool IsLive => File.Exists(Path.Combine(AppContext.BaseDirectory, Dll));

    public static BrightChoice Choice
    {
        get
        {
            if (!IsLive) return Local.Choice;
            try { return (BrightChoice)brd_sdk_get_consent_choice_c(); }
            catch { return Local.Choice; }
        }
    }

    public static void Start()
    {
        if (!IsLive) return;
        var cfg = Path.Combine(AppContext.BaseDirectory, "brd_config.json");
        if (File.Exists(cfg))
        {
            using var doc = JsonDocument.Parse(File.ReadAllText(cfg));
            var id = doc.RootElement.GetProperty("app_id").GetString();
            if (!string.IsNullOrWhiteSpace(id) && id != "REPLACE_WITH_BRIGHT_APPID")
                brd_sdk_set_appid_c(id);
        }
        brd_sdk_set_app_name_c("AFKMAXX");
        brd_sdk_set_benefit_c("keep AFKMAXX desktop checks available");
        brd_sdk_set_skip_consent_on_init_c(1);
        brd_sdk_init_c();
    }

    public static void ShowConsent()
    {
        if (IsLive) brd_sdk_show_consent_c();
        else Local.Choice = BrightChoice.Peer;
    }

    public static void OptOut()
    {
        if (IsLive) brd_sdk_opt_out_c();
        else Local.Choice = BrightChoice.NotPeer;
    }

    public static void Close()
    {
        if (IsLive) brd_sdk_close_c();
    }

    static class Local
    {
        static readonly string PathName = System.IO.Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "AFKMAXX", "bright-choice.txt");

        public static BrightChoice Choice
        {
            get
            {
                try
                {
                    var raw = File.ReadAllText(PathName);
                    return Enum.TryParse(raw, out BrightChoice c) ? c : BrightChoice.None;
                }
                catch { return BrightChoice.None; }
            }
            set
            {
                Directory.CreateDirectory(System.IO.Path.GetDirectoryName(PathName)!);
                File.WriteAllText(PathName, value.ToString());
            }
        }
    }

    [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)] static extern void brd_sdk_init_c();
    [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)] static extern void brd_sdk_close_c();
    [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)] static extern void brd_sdk_show_consent_c();
    [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)] static extern void brd_sdk_opt_out_c();
    [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)] static extern int brd_sdk_get_consent_choice_c();
    [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)] static extern void brd_sdk_set_appid_c(string appid);
    [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)] static extern void brd_sdk_set_app_name_c(string name);
    [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)] static extern void brd_sdk_set_benefit_c(string text);
    [DllImport(Dll, CallingConvention = CallingConvention.Cdecl)] static extern void brd_sdk_set_skip_consent_on_init_c(int skip);
}
