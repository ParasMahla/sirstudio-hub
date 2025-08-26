import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { 
  GraduationCap, 
  BarChart3, 
  BookOpen, 
  Briefcase, 
  HelpingHand, 
  NotebookPen, 
  CheckCircle2, 
  Quote, 
  Star,
  Award,
  Users,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target
} from "lucide-react";
import { SeoHead } from "@/components/SeoHead";
import { supabase } from "@/integrations/supabase/client";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Link } from "react-router-dom";
import logo from "@/assets/sir-studio-logo.png";

const SERVICES = [
  { 
    key: "Statistical Analysis", 
    icon: BarChart3, 
    desc: "Advanced data analysis with SPSS, R, Python & crystal-clear interpretations.", 
    features: ["Complex Statistical Tests", "Data Visualization", "Result Interpretation"],
    gradient: "from-blue-500 to-purple-600"
  },
  { 
    key: "Research Writing", 
    icon: NotebookPen, 
    desc: "Expert thesis, dissertations & publication-ready manuscripts.", 
    features: ["Thesis Writing", "Literature Review", "Manuscript Preparation"],
    gradient: "from-purple-500 to-pink-600"
  },
  { 
    key: "Academic Help", 
    icon: BookOpen, 
    desc: "Comprehensive coursework guidance and subject mastery support.", 
    features: ["Assignment Help", "Study Materials", "Concept Clarity"],
    gradient: "from-green-500 to-teal-600"
  },
  { 
    key: "Career Counselling", 
    icon: Briefcase, 
    desc: "Strategic planning for academic and professional growth.", 
    features: ["Career Planning", "Interview Prep", "Skill Development"],
    gradient: "from-orange-500 to-red-600"
  },
  { 
    key: "Exam Preparation", 
    icon: GraduationCap, 
    desc: "Personalized study plans with comprehensive mock assessments.", 
    features: ["Study Plans", "Mock Tests", "Performance Analysis"],
    gradient: "from-indigo-500 to-blue-600"
  },
  { 
    key: "CSR Activities", 
    icon: HelpingHand, 
    desc: "Community engagement and personal development programs.", 
    features: ["Social Impact", "Skill Building", "Leadership Development"],
    gradient: "from-pink-500 to-rose-600"
  },
];

const STATS = [
  { icon: Users, value: "2500+", label: "Happy Students" },
  { icon: Award, value: "98%", label: "Success Rate" },
  { icon: Clock, value: "24/7", label: "Expert Support" },
  { icon: Star, value: "4.9/5", label: "Client Rating" },
];

const FEATURES = [
  { icon: Shield, title: "Secure & Confidential", desc: "Your data and work remain completely private" },
  { icon: Zap, title: "Lightning Fast", desc: "Quality work delivered within your timeline" },
  { icon: Target, title: "Tailored Solutions", desc: "Customized approach for your specific needs" },
  { icon: TrendingUp, title: "Proven Excellence", desc: "Track record of academic success" },
];

const TESTIMONIALS = [
  {
    name: "Dr. Sarah Johnson",
    role: "PhD Graduate",
    content: "SIR STUDIO transformed my thesis journey. Their statistical analysis expertise and writing support were exceptional.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "MBA Student",
    content: "Outstanding career counselling and academic support. They helped me secure my dream job while maintaining excellent grades.",
    rating: 5
  },
  {
    name: "Priya Sharma",
    role: "Research Scholar",
    content: "The research writing assistance was phenomenal. My paper got published in a top-tier journal thanks to their guidance.",
    rating: 5
  }
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Initial Consultation",
    desc: "We understand your specific requirements and academic goals through detailed discussion."
  },
  {
    step: "02", 
    title: "Custom Strategy",
    desc: "Our experts develop a tailored approach based on your needs and timeline."
  },
  {
    step: "03",
    title: "Expert Execution", 
    desc: "Dedicated specialists work on your project with regular progress updates."
  },
  {
    step: "04",
    title: "Quality Assurance",
    desc: "Rigorous review and refinement to ensure exceptional standards."
  },
  {
    step: "05",
    title: "Final Delivery",
    desc: "Complete project delivery with ongoing support and revisions if needed."
  }
];

const FAQ_ITEMS = [
  {
    question: "Do you help with full thesis writing?",
    answer: "Yes, we provide comprehensive thesis support from proposal development to final submission, including formatting, citations, and plagiarism checks."
  },
  {
    question: "What statistical software do you use?",
    answer: "We're proficient in SPSS, R, Python, SAS, and other advanced statistical tools based on your specific requirements."
  },
  {
    question: "How do you ensure confidentiality?",
    answer: "We maintain strict confidentiality protocols with secure data handling and non-disclosure agreements for all projects."
  },
  {
    question: "What's your typical turnaround time?",
    answer: "Turnaround varies by project complexity. We provide realistic timelines during consultation and always meet agreed deadlines."
  },
  {
    question: "Do you offer revision support?",
    answer: "Yes, we provide comprehensive revision support to ensure your complete satisfaction with the final deliverable."
  }
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
  const [phone, setPhone] = useState("");
  const [service, setService] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
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

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const notifyEmail = "hello@sirstudio.com";

  const faqJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer }
    }))
  }), []);

  const orgJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SIR STUDIO",
    url: typeof window !== 'undefined' ? window.location.origin : "",
    email: notifyEmail,
    description: "Premium academic services for thesis writing, statistical analysis, and research support.",
  }), [notifyEmail]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !service) {
      toast("Please fill in your name, email, and service of interest.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('inquiries')
        .insert({
          name,
          email,
          phone: phone || null,
          service,
          message: message || null,
          status: 'pending'
        });

      if (error) throw error;

      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
            body: JSON.stringify({
              type: "lead_inquiry",
              toEmail: notifyEmail,
              payload: { name, email, phone, service, message },
              source: typeof window !== 'undefined' ? window.location.href : "",
            }),
          });
        } catch (webhookError) {
          console.warn("Webhook failed, but inquiry saved to database:", webhookError);
        }
      }

      toast("🎉 Thank you! Your inquiry has been submitted successfully.");
      setName("");
      setEmail("");
      setPhone("");
      setService("");
      setMessage("");
    } catch (err) {
      console.error(err);
      const inquiry: Inquiry = {
        id: crypto.randomUUID(),
        name,
        email,
        service,
        message: message || undefined,
        createdAt: new Date().toISOString(),
      };
      saveInquiry(inquiry);
      toast("Saved locally. Database connection issue - please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <SeoHead
        title="SIR STUDIO – Premium Academic Services & Expert Thesis Support"
        description="Transform your academic journey with expert thesis writing, advanced statistical analysis, and comprehensive academic guidance."
        canonical="/"
      />

      {/* Modern Header */}
      <header className="fixed top-0 w-full z-50 glass-effect border-b border-white/10">
        <div className="container flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-3 group" aria-label="SIR STUDIO home">
            <img 
              src={logo} 
              alt="SIR STUDIO logo" 
              className="h-10 w-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" 
              loading="lazy" 
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              SIR STUDIO
            </span>
          </a>
          <nav className="hidden gap-8 md:flex">
            {["Services", "About", "Process", "Testimonials", "FAQ", "Contact"].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="relative text-sm font-medium hover:text-primary transition-all duration-300 group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
            <Link to="/auth" className="text-sm font-medium hover:text-primary transition-colors">Admin</Link>
          </nav>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 aurora-bg" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          
          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-xl animate-float" />
          <div className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />

          <div className="relative container text-center px-4">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-8 animate-pulse-glow">
                <Sparkles className="w-4 h-4" />
                Premium Academic Excellence
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
                Transform Your 
                <span className="shimmer-text block mt-2">Academic Journey</span>
              </h1>
              
              <p className="mt-8 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Expert thesis writing, advanced statistical analysis, and comprehensive academic support 
                <span className="text-primary font-semibold block mt-2">tailored for your unprecedented success</span>
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button asChild variant="gradient" size="xl" className="group shadow-2xl">
                  <a href="#contact" className="flex items-center gap-2">
                    Start Your Success Story
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
                <Button asChild variant="glass" size="xl">
                  <a href="#services">Explore Services</a>
                </Button>
                <WhatsAppButton 
                  message="Hi SIR STUDIO! I need expert help with my academic work. Can we discuss my requirements?"
                  size="lg"
                  className="glass-effect hover:bg-[#25D366]/20"
                />
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center group animate-on-scroll">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 mb-4 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">{value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Services */}
        <section id="services" className="py-20">
          <div className="container">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-4xl font-bold mb-4">Our Premium Services</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive academic solutions designed to elevate your journey
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map(({ key, icon: Icon, desc, features, gradient }, index) => (
                <div 
                  key={key} 
                  className="animate-on-scroll group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card className="h-full border-0 bg-gradient-to-br from-white to-white/80 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{key}</CardTitle>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{desc}</p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <WhatsAppButton 
                        message={`Hi SIR STUDIO! I need expert help with ${key}. Can we discuss my requirements?`}
                        size="sm"
                        className="w-full mt-6 group-hover:scale-105 transition-transform duration-300"
                      />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-gradient-to-br from-muted/20 to-primary/5">
          <div className="container">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <div className="animate-on-scroll">
                <h2 className="text-4xl font-bold mb-6">Why Choose SIR STUDIO?</h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  We're not just another academic service. We're your partners in academic excellence, 
                  committed to transforming your educational journey with personalized expertise.
                </p>
                
                <div className="space-y-6">
                  {FEATURES.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{title}</h3>
                        <p className="text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="animate-on-scroll">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl blur-3xl" />
                  <Card className="relative bg-gradient-to-br from-white to-white/80 shadow-2xl">
                    <CardContent className="p-8">
                      <div className="text-center mb-6">
                        <div className="text-6xl font-bold text-primary mb-2">5+</div>
                        <p className="text-muted-foreground">Years of Excellence</p>
                      </div>
                      <div className="grid grid-cols-2 gap-6 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">50+</div>
                          <p className="text-sm text-muted-foreground">Expert Consultants</p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">100+</div>
                          <p className="text-sm text-muted-foreground">Universities Served</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section id="process" className="py-20">
          <div className="container">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-4xl font-bold mb-4">Our Proven Process</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                A systematic approach to ensure your academic success
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary to-primary/30 hidden lg:block" />
              
              <div className="space-y-12">
                {PROCESS_STEPS.map(({ step, title, desc }, index) => (
                  <div 
                    key={step} 
                    className={`animate-on-scroll flex items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="flex-1">
                      <Card className="bg-gradient-to-br from-white to-white/80 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
                              {step}
                            </div>
                            <h3 className="text-xl font-semibold">{title}</h3>
                          </div>
                          <p className="text-muted-foreground">{desc}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="hidden lg:block w-8 h-8 rounded-full bg-primary border-4 border-white shadow-lg relative z-10" />
                    <div className="flex-1 hidden lg:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-gradient-to-br from-muted/20 to-primary/5">
          <div className="container">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-4xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Real stories from students who transformed their academic journey with us
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {TESTIMONIALS.map(({ name, role, content, rating }, index) => (
                <div 
                  key={name} 
                  className="animate-on-scroll"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card className="h-full bg-gradient-to-br from-white to-white/80 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      
                      <Quote className="w-8 h-8 text-primary/30 mb-4" />
                      <p className="text-muted-foreground mb-6 leading-relaxed">{content}</p>
                      
                      <div>
                        <div className="font-semibold">{name}</div>
                        <div className="text-sm text-muted-foreground">{role}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20">
          <div className="container">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Get answers to common questions about our services
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {FAQ_ITEMS.map(({ question, answer }, index) => (
                <div 
                  key={index} 
                  className="animate-on-scroll"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card className="bg-gradient-to-br from-white to-white/80 shadow-lg">
                    <CardContent className="p-0">
                      <button
                        className="w-full p-6 text-left hover:bg-muted/20 transition-colors"
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{question}</h3>
                          <div className={`transform transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}>
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </div>
                      </button>
                      
                      {expandedFaq === index && (
                        <div className="px-6 pb-6">
                          <p className="text-muted-foreground leading-relaxed">{answer}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Contact Form */}
        <section id="contact" className="py-20 bg-gradient-to-br from-muted/30 to-primary/5">
          <div className="container">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <div className="animate-on-scroll">
                <h2 className="text-4xl font-bold mb-6">Start Your Success Story</h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Ready to transform your academic journey? Connect with our expert consultants.
                </p>
                
                <div className="space-y-6">
                  {FEATURES.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{title}</h3>
                        <p className="text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="animate-on-scroll gradient-border shadow-2xl bg-gradient-to-br from-white to-white/80">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl mb-2">Request Expert Consultation</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input 
                          id="name" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          placeholder="Your name"
                          className="transition-all duration-300 focus:scale-105"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="your@email.com"
                          className="transition-all duration-300 focus:scale-105"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="Your phone number (optional)"
                        className="transition-all duration-300 focus:scale-105"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Service of Interest *</Label>
                      <Select value={service} onValueChange={setService}>
                        <SelectTrigger className="transition-all duration-300 focus:scale-105">
                          <SelectValue placeholder="Choose your service" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICES.map((s) => (
                            <SelectItem key={s.key} value={s.key}>{s.key}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Project Details</Label>
                      <Textarea 
                        id="message" 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        placeholder="Tell us about your project and requirements..."
                        rows={4}
                        className="transition-all duration-300 focus:scale-105"
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        type="submit" 
                        variant="gradient" 
                        size="lg" 
                        disabled={loading} 
                        className="flex-1 group"
                      >
                        {loading ? "Submitting..." : "Submit Request"}
                        {!loading && <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />}
                      </Button>
                    </div>
                    
                    <WhatsAppButton 
                      message={`Hi SIR STUDIO! I'd like to discuss my project. Name: ${name}, Email: ${email}${phone ? `, Phone: ${phone}` : ''}, Service: ${service}${message ? `, Details: ${message}` : ''}`}
                      size="lg"
                      className="w-full"
                    />
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-r from-muted to-muted/80 border-t">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="SIR STUDIO logo" className="h-8 w-8" />
                <span className="text-xl font-bold">SIR STUDIO</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Transforming academic journeys with expert guidance and innovative solutions.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Email: {notifyEmail}</p>
                <p>WhatsApp: +91 7297980809</p>
                <p>Available 24/7</p>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground text-sm">
            © {new Date().getFullYear()} SIR STUDIO. All rights reserved. Crafted with excellence.
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <WhatsAppButton 
        variant="floating" 
        message="Hi SIR STUDIO! I need premium academic support. Can we discuss?" 
        className="animate-bounce-gentle"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
};

export default Index;
