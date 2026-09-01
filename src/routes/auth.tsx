import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTurnstileConfig, verifyTurnstile } from "@/lib/turnstile.functions";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CalendarCheck2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const verifyCaptcha = useServerFn(verifyTurnstile);
  const { data: turnstile } = useQuery({
    queryKey: ["turnstile-config"],
    queryFn: () => getTurnstileConfig(),
    staleTime: Infinity,
  });
  const captchaOn = Boolean(turnstile?.enabled && turnstile.siteKey);

  /** Valideert de Turnstile-token server-side. Geeft false bij afkeuring. */
  const passCaptcha = async (action: string) => {
    if (!captchaOn) return true;
    if (!captchaToken) {
      toast.error("Bevestig eerst de bot-controle");
      return false;
    }
    const res = await verifyCaptcha({ data: { token: captchaToken, action } });
    if (!res.ok) {
      toast.error(res.error ?? "Bot-verificatie mislukt");
      setCaptchaToken("");
      setCaptchaNonce((n) => n + 1);
      return false;
    }
    return true;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/planning" });
    });
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!(await passCaptcha("signin"))) { setLoading(false); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (captchaOn) { setCaptchaToken(""); setCaptchaNonce((n) => n + 1); }
    if (error) return toast.error(error.message);
    toast.success("Ingelogd");
    navigate({ to: "/planning" });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!(await passCaptcha("signup"))) { setLoading(false); return; }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/planning`,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (captchaOn) { setCaptchaToken(""); setCaptchaNonce((n) => n + 1); }
    if (error) return toast.error(error.message);
    toast.success("Account aangemaakt — je bent ingelogd");
    navigate({ to: "/planning" });
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("Google login mislukt");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/planning" });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-3">
            <CalendarCheck2 className="h-6 w-6" />
          </div>
          <CardTitle>Planning</CardTitle>
          <CardDescription>Log in of maak een account aan</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Inloggen</TabsTrigger>
              <TabsTrigger value="signup">Registreren</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-3 mt-4">
                <div>
                  <Label htmlFor="in-email">E-mail</Label>
                  <Input id="in-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="in-pass">Wachtwoord</Label>
                  <Input id="in-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Inloggen
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-3 mt-4">
                <div>
                  <Label htmlFor="up-name">Volledige naam</Label>
                  <Input id="up-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="up-email">E-mail</Label>
                  <Input id="up-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="up-pass">Wachtwoord</Label>
                  <Input id="up-pass" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Account aanmaken
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  De eerste geregistreerde gebruiker wordt automatisch beheerder.
                </p>
              </form>
            </TabsContent>
          </Tabs>

          {captchaOn && (
            <TurnstileWidget
              siteKey={turnstile!.siteKey}
              onToken={setCaptchaToken}
              resetKey={captchaNonce}
            />
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">of</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
            Inloggen met Google
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            <Link to="/" className="underline">Terug naar start</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
