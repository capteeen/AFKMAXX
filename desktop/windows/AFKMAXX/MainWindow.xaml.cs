using System.Diagnostics;
using System.Windows;
using System.Windows.Navigation;

namespace AFKMAXX;

public partial class MainWindow : Window
{
    bool paused = true;
    bool suppressToggle;

    public MainWindow()
    {
        InitializeComponent();
        BrightSdk.Start();
        Render();
        Closed += (_, _) => BrightSdk.Close();
    }

    void Render()
    {
        var peer = BrightSdk.Choice == BrightChoice.Peer;
        var indexing = peer && !paused;
        Eyebrow.Text = indexing ? "YOUR CONNECTION / SIDE QUEST" : "YOUR CONNECTION IS TAKING A BREATHER";
        StatusWord.Text = paused ? "PAUSED" : peer ? "INDEXING" : "IDLE";
        StatusWord.Foreground = indexing
            ? (System.Windows.Media.Brush)FindResource("Mint")
            : (System.Windows.Media.Brush)FindResource("Paper");
        StatusMark.Text = indexing ? "●" : "Ⅱ";
        PauseButton.Content = paused ? "Start side quest  ↗" : "Pause  Ⅱ";
        IndexHint.Text = peer
            ? "When enabled you keep AFKMAXX desktop checks available."
            : "Enable to keep AFKMAXX desktop checks available.";
        SdkNote.Text = BrightSdk.IsLive
            ? ""
            : "Bright SDK DLL is not in this folder yet. Place lum_sdk64.dll, net_updater64.exe, and your AppID next to the exe, then restart.";
        StatusNote.Text = peer
            ? "Web Indexing is on. Bright SDK may use idle CPU and bandwidth. Pause anytime."
            : "Enable Web Indexing to share idle resources. You can turn it off in this window.";
        suppressToggle = true;
        IndexToggle.IsChecked = peer;
        suppressToggle = false;
    }

    void OnPause(object sender, RoutedEventArgs e)
    {
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

    void OnIndexOn(object sender, RoutedEventArgs e)
    {
        if (suppressToggle) return;
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

    void OnLink(object sender, RequestNavigateEventArgs e)
    {
        Process.Start(new ProcessStartInfo(e.Uri.AbsoluteUri) { UseShellExecute = true });
        e.Handled = true;
    }
}
