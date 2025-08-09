import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { SeoHead } from "@/components/SeoHead";

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  service: string;
  message?: string;
  createdAt: string;
  handled?: boolean;
};

const SERVICES = [
  "All",
  "Statistical Analysis",
  "Research Writing",
  "Academic Help",
  "Career Counselling",
  "Exam Preparation",
  "CSR Activities",
];

export default function Admin() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [filter, setFilter] = useState("All");
  const [rows, setRows] = useState<Inquiry[]>([]);

  useEffect(() => {
    const savedWebhook = localStorage.getItem("sir_webhook_url");
    if (savedWebhook) setWebhookUrl(savedWebhook);
    const savedEmail = localStorage.getItem("sir_notify_email") || "info@sirstudio.in";
    setNotifyEmail(savedEmail);
    const list: Inquiry[] = JSON.parse(localStorage.getItem("sir_inquiries") || "[]");
    setRows(list);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "All") return rows;
    return rows.filter((r) => r.service === filter);
  }, [filter, rows]);

  const saveConfig = () => {
    localStorage.setItem("sir_webhook_url", webhookUrl.trim());
    localStorage.setItem("sir_notify_email", notifyEmail.trim());
    toast("Settings saved");
  };

  const markHandled = (id: string, handled: boolean) => {
    const next = rows.map((r) => (r.id === id ? { ...r, handled } : r));
    setRows(next);
    localStorage.setItem("sir_inquiries", JSON.stringify(next));
  };

  const resend = async (row: Inquiry) => {
    if (!webhookUrl) {
      toast("Please set a Zapier webhook first.");
      return;
    }
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({ type: "resend_lead", toEmail: notifyEmail, payload: row }),
      });
      toast("Request sent. Check your Zap's history.");
    } catch (e) {
      console.error(e);
      toast("Failed to send.");
    }
  };

  const exportCsv = () => {
    const header = ["id", "name", "email", "service", "message", "createdAt", "handled"];
    const lines = [header.join(",")].concat(
      rows.map((r) => [r.id, r.name, r.email, r.service, (r.message || "").replace(/,/g, ";"), r.createdAt, String(!!r.handled)].join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sir-inquiries-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Admin – SIR STUDIO Inquiries Dashboard"
        description="View and manage SIR STUDIO inquiries. Configure Zapier webhook to email your chosen address."
        canonical="/admin"
      />

      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <a href="/" className="font-semibold">← Back to site</a>
          <div className="text-sm text-muted-foreground">Local-only demo dashboard</div>
        </div>
      </header>

      <main className="container py-8 md:py-12 space-y-8">
        <section>
          <Card className="shadow-[var(--shadow-elevated)]">
            <CardHeader>
              <CardTitle>Secure this dashboard</CardTitle>
              <CardDescription>
                To add real authentication and persistent storage, please connect Supabase in Lovable (top right) and let me know to enable protected admin access and email functions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a className="text-primary underline" href="https://docs.lovable.dev/integrations/supabase/" target="_blank" rel="noreferrer">Read how to connect Supabase</a>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="shadow-[var(--shadow-elevated)]">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Add a Zapier Webhook URL and your recipient email. New inquiries will be POSTed to your Zap so it can send the email.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="webhook">Zapier Webhook URL</Label>
                <Input id="webhook" placeholder="https://hooks.zapier.com/..." value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notifyEmail">Recipient email</Label>
                <Input id="notifyEmail" placeholder="info@sirstudio.in" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} />
              </div>
              <div className="md:col-span-3">
                <Button onClick={saveConfig} variant="gradient">Save settings</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-2xl font-semibold">Inquiries</h2>
            <div className="flex items-center gap-3">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={exportCsv} variant="hero">Export CSV</Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="hidden md:table-cell">Message</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">No inquiries yet.</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id} className={r.handled ? "opacity-70" : undefined}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell className="truncate max-w-[16ch]">{r.email}</TableCell>
                      <TableCell>{r.service}</TableCell>
                      <TableCell className="hidden md:table-cell truncate max-w-[40ch]">{r.message}</TableCell>
                      <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{r.handled ? "Handled" : "Open"}</TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" variant="outline" onClick={() => markHandled(r.id, !r.handled)}>
                          {r.handled ? "Reopen" : "Mark handled"}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => resend(r)}>
                          Send email
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </section>
      </main>
    </div>
  );
}
