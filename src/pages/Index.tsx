import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { GraduationCap, BarChart3, BookOpen, Briefcase, HelpingHand, NotebookPen } from "lucide-react";
import { SeoHead } from "@/components/SeoHead";

const SERVICES = [
  { key: "Statistical Analysis", icon: BarChart3, desc: "Advanced data analysis, tests, and results interpretation." },
  { key: "Research Writing", icon: NotebookPen, desc: "Thesis, dissertation, and publication-ready manuscripts." },
  { key: "Academic Help", icon: BookOpen, desc: "Coursework guidance and subject understanding support." },
  { key: "Career Counselling", icon: Briefcase, desc: "Strategic planning for academic and professional growth." },
  { key: "Exam Preparation", icon: GraduationCap, desc: "Personalized study plans and mock assessments." },
  { key: "CSR Activities", icon: HelpingHand, desc: "Community engagement and personal development programs." },
];

function useZapierWebhook() {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    const saved = localStorage.getItem("sir_webhook_url");
    if (saved) setUrl(saved);
  }, []);
  const save = (next: string) => {
    setUrl(next);
    localStorage.setItem("sir_webhook_url", next);
  };
  return { url, save };
}

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  service: string;
  message?: string;
  createdAt: string;
  handled?: boolean;
};

function saveInquiry(inquiry: Inquiry) {
  const list: Inquiry[] = JSON.parse(localStorage.getItem("sir_inquiries") || "[]");
  list.unshift(inquiry);
  localStorage.setItem("sir_inquiries", JSON.stringify(list));
}

const Index = () => {
  const { url: webhookUrl } = useZapierWebhook();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--cursor-x", `${x}%`);
      el.style.setProperty("--cursor-y", `${y}%`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SIR STUDIO",
    url: window.location.origin,
    email: "info@sirstudio.in",
    sameAs: [],
    description:
      "Academic partner for thesis writing, statistical analysis, research writing, academic help, career counselling, exam preparation, and CSR activities.",
  }), []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !service) {
      toast("Please fill in your name, email, and service of interest.");
      return;
    }

    const inquiry: Inquiry = {
      id: crypto.randomUUID(),
      name,
      email,
      service,
      message: message || undefined,
      createdAt: new Date().toISOString(),
    };

    setLoading(true);
    saveInquiry(inquiry);

    try {
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            type: "lead_inquiry",
            toEmail: "info@sirstudio.in",
            payload: inquiry,
            source: window.location.href,
          }),
        });
        toast("Thank you! Your details were sent to our support team.");
      } else {
        toast(
          "Saved locally. Add a Zapier webhook in the Admin dashboard to auto-email info@sirstudio.in.",
        );
      }

      setName("");
      setEmail("");
      setService("");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast("We couldn't send your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="SIR STUDIO – Academic Services & Thesis Support"
        description="Thesis writing, statistical analysis, research writing, academic help, career counselling, exam preparation, and CSR activities."
        canonical={"/"}
      />

      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[hsl(var(--brand))]" aria-hidden />
            <span className="text-lg font-semibold">SIR STUDIO</span>
          </a>
          <nav className="hidden gap-6 md:flex">
            <a href="#services" className="hover:text-primary">Services</a>
            <a href="#contact" className="hover:text-primary">Contact</a>
            <a href="/admin" className="hover:text-primary">Admin</a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section ref={heroRef} className="relative overflow-hidden">
          <div className="absolute inset-0 aurora-bg" aria-hidden />
          <div className="relative container py-20 md:py-28">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-3xl">
              Expert Thesis Writing and Academic Services for Every Stage
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl">
              Your trusted academic partner for research, analysis, and guidance.
              From topic selection to final submission — we’re with you all the way.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild variant="gradient" size="lg">
                <a href="#contact">Get Started</a>
              </Button>
              <Button asChild variant="hero" size="lg">
                <a href="#services">Explore Services</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="container py-14 md:py-20">
          <h2 className="text-3xl font-semibold">Our Core Services</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Tailored support designed to enhance your academic and professional success.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ key, icon: Icon, desc }) => (
              <Card key={key} className="transition-transform hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="p-2 rounded-md bg-secondary">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{key}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{desc}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact / Lead form */}
        <section id="contact" className="border-t bg-muted/30">
          <div className="container py-14 md:py-20 grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold">Start your journey</h2>
              <p className="mt-2 text-muted-foreground">
                Fill out the form and our academic consultant will reach out shortly.
                We’ll also notify our team at info@sirstudio.in.
              </p>

              <div className="mt-6 text-sm text-muted-foreground">
                • Secure and private • No spam • Quick response
              </div>
            </div>

            <Card className="shadow-[var(--shadow-elevated)]">
              <CardHeader>
                <CardTitle>Request a Consultation</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Service of interest</Label>
                    <Select value={service} onValueChange={setService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICES.map((s) => (
                          <SelectItem key={s.key} value={s.key}>{s.key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Your message (optional)</Label>
                    <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share your needs or timelines" rows={4} />
                  </div>
                  <Button type="submit" variant="gradient" size="lg" disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                  </Button>
                </form>
                <p className="mt-3 text-xs text-muted-foreground">
                  By submitting, you agree to be contacted regarding your request.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container py-8 text-sm text-muted-foreground flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} SIR STUDIO. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#services" className="hover:text-primary">Services</a>
            <a href="#contact" className="hover:text-primary">Contact</a>
            <a href="/admin" className="hover:text-primary">Admin</a>
          </div>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
};

export default Index;
