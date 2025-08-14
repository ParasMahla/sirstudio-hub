import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { CheckCircle, MessageCircle, Download, RefreshCw, LogOut, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import WhatsAppButton from "@/components/WhatsAppButton";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  message?: string;
  whatsapp_number?: string;
  status: string;
  handled: boolean;
  created_at: string;
  updated_at: string;
}

const AdminNew = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [webhookUrl, setWebhookUrl] = useState("");

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Load inquiries from Supabase
  useEffect(() => {
    if (user) {
      fetchInquiries();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('inquiries-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'inquiries'
          },
          () => {
            fetchInquiries();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Load webhook URL from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sir_webhook_url");
    if (saved) setWebhookUrl(saved);
  }, []);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const saveWebhookConfig = () => {
    localStorage.setItem("sir_webhook_url", webhookUrl);
    toast("Configuration saved!");
  };

  const markHandled = async (id: string, handled: boolean) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ handled, status: handled ? 'completed' : 'pending' })
        .eq('id', id);

      if (error) throw error;

      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === id ? { ...inquiry, handled, status: handled ? 'completed' : 'pending' } : inquiry
      ));

      toast(handled ? "Marked as handled" : "Marked as pending");
    } catch (error) {
      console.error('Error updating inquiry:', error);
      toast('Failed to update inquiry');
    }
  };

  const resend = async (inquiry: Inquiry) => {
    if (!webhookUrl) {
      toast("Please configure webhook URL first");
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          type: "resend_inquiry",
          toEmail: "info@sirstudio.com",
          payload: inquiry,
          source: "admin_resend",
        }),
      });
      toast("Inquiry resent via webhook");
    } catch (error) {
      console.error("Webhook error:", error);
      toast("Failed to resend inquiry");
    }
  };

  const exportCsv = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Service", "Message", "Status", "Handled", "Created", "Updated"];
    const csvContent = [
      headers.join(","),
      ...inquiries.map(row => [
        row.id,
        `"${row.name}"`,
        row.email,
        row.phone || "",
        `"${row.service}"`,
        `"${(row.message || "").replace(/"/g, '""')}"`,
        row.status,
        row.handled ? "Yes" : "No",
        new Date(row.created_at).toLocaleDateString(),
        new Date(row.updated_at).toLocaleDateString(),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sir-studio-inquiries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("CSV file downloaded");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Filter inquiries
  const filtered = inquiries.filter(row => {
    if (filter === "all") return true;
    return row.service === filter;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <>
      <SeoHead 
        title="Admin Dashboard - SIR STUDIO"
        description="Manage inquiries and configuration for SIR STUDIO"
        canonical="/admin"
      />
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">SIR STUDIO Admin</h1>
              <Badge variant="secondary">{inquiries.length} inquiries</Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
              <Button variant="outline" size="sm" onClick={() => navigate("/")} asChild>
                <a>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Site
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8 space-y-8">
          {/* Configuration Section */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="webhook">Zapier Webhook URL (optional)</Label>
                  <Input
                    id="webhook"
                    type="url"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Notifications</Label>
                  <Input
                    type="email"
                    value="info@sirstudio.com"
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
              <Button onClick={saveWebhookConfig}>Save Configuration</Button>
            </CardContent>
          </Card>

          {/* WhatsApp Integration Info */}
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                WhatsApp click-to-chat is active with number: <strong>+91 94609 80809</strong>
              </p>
              <div className="flex gap-2">
                <WhatsAppButton 
                  message="Test message from SIR STUDIO admin panel"
                  size="sm"
                />
                <Button variant="outline" size="sm" asChild>
                  <a href="https://wa.me/919460980809" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open WhatsApp Web
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inquiries Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Inquiries Management</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchInquiries}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={exportCsv}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="Statistical Analysis">Statistical Analysis</SelectItem>
                    <SelectItem value="Research Writing">Research Writing</SelectItem>
                    <SelectItem value="Academic Help">Academic Help</SelectItem>
                    <SelectItem value="Career Counselling">Career Counselling</SelectItem>
                    <SelectItem value="Exam Preparation">Exam Preparation</SelectItem>
                    <SelectItem value="CSR Activities">CSR Activities</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No inquiries found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{row.service}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {row.message || "No message"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={row.handled ? "default" : "secondary"}>
                              {row.handled ? "Handled" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(row.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markHandled(row.id, !row.handled)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <WhatsAppButton 
                                message={`Hi ${row.name}! This is SIR STUDIO regarding your inquiry about ${row.service}. How can we help you further?`}
                                size="sm"
                                className="h-8 w-8 p-0"
                              />
                              {webhookUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => resend(row)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default AdminNew;