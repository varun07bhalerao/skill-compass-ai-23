import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Target, Map, ArrowRight, Sparkles, BarChart3, Users } from "lucide-react";

const Landing = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    { icon: FileText, title: t("landing.feature1.title"), desc: t("landing.feature1.desc"), color: "from-primary to-info" },
    { icon: Target, title: t("landing.feature2.title"), desc: t("landing.feature2.desc"), color: "from-secondary to-success" },
    { icon: Map, title: t("landing.feature3.title"), desc: t("landing.feature3.desc"), color: "from-accent to-primary" },
  ];

  const stats = [
    { icon: Users, value: "10,000+", label: "Students Helped" },
    { icon: BarChart3, value: "85%", label: "Placement Rate" },
    { icon: Sparkles, value: "50+", label: "Career Paths" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(215_85%_45%_/_0.15),_transparent_50%)]" />
        <div className="container relative py-24 md:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary-foreground/80">
              <Sparkles className="h-4 w-4" />
              AI-Powered Career Guidance
            </div>
            <h1 className="mb-6 font-display text-4xl font-bold leading-tight tracking-tight text-primary-foreground md:text-6xl">
              {t("landing.tagline")}
            </h1>
            <p className="mb-10 text-lg text-primary-foreground/70 md:text-xl">
              {t("landing.subtitle")}
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
                className="gap-2 rounded-full px-8 text-base shadow-lg"
              >
                {t("landing.getStarted")}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login?demo=true")}
                className="gap-2 rounded-full border-primary-foreground/30 px-8 text-base text-primary-foreground hover:bg-primary-foreground/10"
              >
                {t("landing.tryDemo")}
              </Button>
            </div>
          </div>
        </div>
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0,40 C360,80 720,0 1440,40 L1440,80 L0,80 Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="container -mt-4 relative z-10">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="border-0 bg-card shadow-lg animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <stat.icon className="mb-2 h-6 w-6 text-primary" />
                <span className="font-display text-2xl font-bold md:text-3xl">{stat.value}</span>
                <span className="text-xs text-muted-foreground md:text-sm">{stat.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-24">
        <h2 className="mb-12 text-center font-display text-3xl font-bold md:text-4xl">How SkillBridge Works</h2>
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {features.map((feature, i) => (
            <Card
              key={i}
              className="group border-0 bg-card shadow-md transition-all hover:shadow-xl hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <CardContent className="p-8">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}>
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="mx-auto max-w-3xl rounded-2xl p-12 text-center" style={{ background: "var(--gradient-primary)" }}>
          <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground">
            Ready to accelerate your career?
          </h2>
          <p className="mb-8 text-primary-foreground/80">
            Upload your resume and get personalized career guidance in minutes.
          </p>
          <Button
            size="lg"
            onClick={() => navigate(isAuthenticated ? "/resume" : "/login")}
            className="rounded-full bg-primary-foreground px-8 text-primary hover:bg-primary-foreground/90"
          >
            Start Free Analysis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 SkillBridge. AI-powered career guidance for students and graduates.</p>
          <p className="mt-2 text-xs">Your data is processed securely. We do not store your resume permanently.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
