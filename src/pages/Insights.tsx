import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Meta } from "@/components/seo/Meta";
import { insights } from "@/data/mockData";
import { ArrowRight } from "lucide-react";

const Insights = () => {
  return (
    <>
      <Meta
        title="Insights"
        description="Perspectives on investing, building, and scaling exceptional businesses from the Ethos Ventures team"
        canonicalUrl={`${window.location.origin}/insights`}
      />

      <div className="min-h-screen">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-4xl">
            <h1 className="mb-6">Insights</h1>
            <p className="text-xl text-body">
              Perspectives on investing, building, and scaling exceptional businesses
            </p>
          </div>
        </section>

        {/* Articles */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
            {insights.map((insight) => (
              <Card
                key={insight.slug}
                className="p-6 hover:shadow-lg transition-smooth"
              >
                <div className="flex flex-col h-full">
                  <div className="text-xs font-medium text-accent mb-2">
                    {insight.category}
                  </div>
                  <h2 className="text-xl mb-3">{insight.title}</h2>
                  <p className="text-sm text-body mb-4 flex-grow">
                    {insight.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-subtle mb-4">
                    <span>{insight.author}</span>
                    <span>{insight.date}</span>
                  </div>
                  <Link
                    to={`/insights/${insight.slug}`}
                    className="text-sm font-medium text-primary hover:text-accent inline-flex items-center transition-smooth"
                  >
                    Read article <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Insights;
