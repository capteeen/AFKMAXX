using System.Diagnostics;
using System.Net.NetworkInformation;
using System.Windows;
using System.Windows.Navigation;
using System.Windows.Threading;

namespace AFKMAXX;

public partial class MainWindow : Window
{
    bool paused = true;
    bool suppressToggle;
    bool signedIn;
    string email = "";
    string? pendingTicket;
    readonly DispatcherTimer poll = new() { Interval = TimeSpan.FromMilliseconds(1500) };

    public MainWindow()
    {
        InitializeComponent();
        BrightSdk.Start();
        poll.Tick += async (_, _) => await PollLogin();
        NetworkChange.NetworkAvailabilityChanged += (_, _) => Dispatcher.Invoke(OnNetworkChanged);
        Loaded += async (_, _) => await RestoreAccount();
        Closed += (_, _) => BrightSdk.Close();
        Render();
    }

    bool Online => NetworkInterface.GetIsNetworkAvailable();

    void OnNetworkChanged()
    {
        if (!Online)
        {
            paused = true;
        }
        Render();
    }

    async Task RestoreAccount()
    {
        var token = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        var path = System.IO.Path.Combine(token, "AFKMAXX", "device.token");
        if (!System.IO.File.Exists(path)) return;
        var saved = (await System.IO.File.ReadAllTextAsync(path)).Trim();
        if (saved.Length == 0) return;
        var found = await DesktopClient.Me(saved);
        if (found == "") { System.IO.File.Delete(path); return; }
        if (found is null) return;
        signedIn = true;
        email = found;
        Render();
    }

    void SaveToken(string token)
    {
        var dir = System.IO.Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "AFKMAXX");
        System.IO.Directory.CreateDirectory(dir);
        System.IO.File.WriteAllText(System.IO.Path.Combine(dir, "device.token"), token);
    }

    void Render()
    {
        var peer = BrightSdk.Choice == BrightChoice.Peer;
        var indexing = signedIn && Online && peer && !paused;
        var word = !Online ? "OFFLINE" : !signedIn ? "SIGN IN" : paused ? "PAUSED" : peer ? "INDEXING" : "IDLE";
        Eyebrow.Text = !Online ? "NO INTERNET"
            : !signedIn ? "SIGN IN REQUIRED"
            : indexing ? "YOUR CONNECTION / SIDE QUEST" : "YOUR CONNECTION IS TAKING A BREATHER";
        StatusWord.Text = word;
        SideStatus.Text = word;
        SideHint.Text = !Online ? "Connect to the internet before starting."
            : !signedIn ? "Sign in with the same account as the web dashboard."
            : indexing ? "Idle shares can run while this window stays open." : "Nothing runs until you start.";
        Chip.Text = !Online ? "OFFLINE" : !signedIn ? "SIGN IN" : indexing ? "CHECKING" : "PAUSED";
        Chip.Foreground = indexing
            ? (System.Windows.Media.Brush)FindResource("Mint")
            : (System.Windows.Media.Brush)FindResource("Muted");
        StatusWord.Foreground = indexing
            ? (System.Windows.Media.Brush)FindResource("Mint")
            : (System.Windows.Media.Brush)FindResource("Paper");
        StatusMark.Text = indexing ? "●" : "Ⅱ";
        PauseButton.Content = !Online ? "Waiting for internet"
            : !signedIn ? "Sign in  ↗"
            : paused ? "Start side quest  ↗" : "Pause  Ⅱ";
        PauseButton.IsEnabled = Online;
        IndexToggle.IsEnabled = Online && signedIn;
        IndexHint.Text = peer
            ? "When enabled you keep AFKMAXX desktop checks available."
            : "Enable to keep AFKMAXX desktop checks available.";
        SdkNote.Text = BrightSdk.IsLive
            ? (signedIn ? $"Signed in as {email}." : "Sign in with the same account as the web app.")
            : "Bright SDK DLL is not in this folder yet. Place lum_sdk64.dll, net_updater64.exe, and your AppID next to the exe, then restart.";
        StatusNote.Text = !Online ? "No internet. AFKMAXX waits until this PC is online before it starts."
            : !signedIn ? "Sign in. Then you can start checks and open the dashboard."
            : peer
            ? "Web Indexing is on. Bright SDK may use idle CPU and bandwidth. Pause anytime."
            : "Enable Web Indexing to share idle resources. You can turn it off in this window.";
        suppressToggle = true;
        IndexToggle.IsChecked = peer;
        suppressToggle = false;
    }

    async void OnPause(object sender, RoutedEventArgs e)
    {
        if (!Online) { Render(); return; }
        if (!signedIn)
        {
            await StartLogin();
            return;
        }
        if (BrightSdk.Choice != BrightChoice.Peer)
        {
            if (!BrightSdk.IsLive && MessageBox.Show(this,
                    "Share idle CPU and bandwidth via Bright SDK so AFKMAXX desktop checks stay available? You can disable Web Indexing anytime.",
                    "Web Indexing", MessageBoxButton.OKCancel) != MessageBoxResult.OK)
                return;
            BrightSdk.ShowConsent();
            if (BrightSdk.Choice != BrightChoice.Peer) return;
            paused = false;
            Render();
            return;
        }
        paused = !paused;
        Render();
    }

    async Task StartLogin()
    {
        try
        {
            var start = await DesktopClient.StartLogin();
            if (start is null)
            {
                MessageBox.Show(this, "Could not start sign in. Is the web app running at localhost:4173?", "AFKMAXX");
                return;
            }
            pendingTicket = start.Value.ticket;
            Process.Start(new ProcessStartInfo(start.Value.loginUrl) { UseShellExecute = true });
            poll.Start();
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, "AFKMAXX");
        }
    }

    async Task PollLogin()
    {
        if (pendingTicket is null) return;
        try
        {
            var ready = await DesktopClient.Poll(pendingTicket);
            if (ready is null) return;
            SaveToken(ready.Value.token);
            signedIn = true;
            email = ready.Value.email;
            pendingTicket = null;
            poll.Stop();
            Render();
        }
        catch
        {
            /* keep waiting */
        }
    }

    void OnIndexOn(object sender, RoutedEventArgs e)
    {
        if (suppressToggle) return;
        if (!Online || !signedIn)
        {
            suppressToggle = true;
            IndexToggle.IsChecked = false;
            suppressToggle = false;
            if (signedIn) return;
            _ = StartLogin();
            return;
        }
        if (!BrightSdk.IsLive && MessageBox.Show(this,
                "Enable Web Indexing? Idle resources may be used. Learn more at bright-sdk.com.",
                "Web Indexing", MessageBoxButton.OKCancel) != MessageBoxResult.OK)
        {
            suppressToggle = true;
            IndexToggle.IsChecked = false;
            suppressToggle = false;
            return;
        }
        BrightSdk.ShowConsent();
        paused = false;
        Render();
    }

    void OnIndexOff(object sender, RoutedEventArgs e)
    {
        if (suppressToggle) return;
        BrightSdk.OptOut();
        paused = true;
        Render();
    }

    void OnDashboard(object sender, RoutedEventArgs e)
    {
        Process.Start(new ProcessStartInfo($"{DesktopClient.Origin}/app") { UseShellExecute = true });
    }

    void OnLink(object sender, RequestNavigateEventArgs e)
    {
        Process.Start(new ProcessStartInfo(e.Uri.AbsoluteUri) { UseShellExecute = true });
        e.Handled = true;
    }
}
