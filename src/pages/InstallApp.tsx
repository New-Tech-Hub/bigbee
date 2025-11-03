import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Download, CheckCircle2, Chrome, Apple } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";

const InstallApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <>
      <SEOHead
        title="Install Ebeth Boutique App"
        description="Install Ebeth Boutique on your device for quick access to premium fashion, accessories, and groceries. Shop offline with our Progressive Web App."
        keywords="install app, mobile app, pwa, progressive web app, ebeth boutique app"
        canonicalUrl="https://ebeth-boutique.lovable.app/install"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-8">
            <Smartphone className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Install Ebeth Boutique</h1>
            <p className="text-lg text-muted-foreground">
              Get instant access to our store right from your home screen
            </p>
          </div>

          {isInstalled && (
            <Card className="mb-8 border-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-6 h-6" />
                  App Already Installed!
                </CardTitle>
                <CardDescription>
                  Ebeth Boutique is already installed on your device. You can access it from your home screen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/')} className="w-full">
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          )}

          {isInstallable && !isInstalled && (
            <Card className="mb-8 border-primary">
              <CardHeader>
                <CardTitle>Install Now</CardTitle>
                <CardDescription>
                  Add Ebeth Boutique to your home screen for quick access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleInstallClick} className="w-full" size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  Install App
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Chrome className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>On Android</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Tap the menu button (three dots) in Chrome</li>
                  <li>2. Select "Add to Home screen" or "Install app"</li>
                  <li>3. Confirm by tapping "Add" or "Install"</li>
                  <li>4. Find the app icon on your home screen</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Apple className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>On iPhone/iPad</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Tap the Share button in Safari</li>
                  <li>2. Scroll down and tap "Add to Home Screen"</li>
                  <li>3. Enter a name (or keep "Ebeth Boutique")</li>
                  <li>4. Tap "Add" in the top right corner</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle>Why Install?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Faster Access:</strong> Launch directly from your home screen</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Works Offline:</strong> Browse products even without internet</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Full Screen:</strong> Enjoy a native app-like experience</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Always Updated:</strong> Get the latest features automatically</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Save Data:</strong> Cached content means faster loading</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default InstallApp;