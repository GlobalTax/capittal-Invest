import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Meta } from "@/components/seo/Meta";
import { insights } from "@/data/mockData";
import { ArrowLeft, Clock } from "lucide-react";

const InsightDetail = () => {
  const { slug } = useParams();
  const insight = insights.find((i) => i.slug === slug);

  if (!insight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4">Article not found</h1>
          <Button asChild>
            <Link to="/insights">Back to Insights</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Meta
        title={insight.title}
        description={insight.excerpt}
        canonicalUrl={`${window.location.origin}/insights/${insight.slug}`}
      />

      <div className="min-h-screen">
        <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Button variant="ghost" asChild className="mb-8">
            <Link to="/insights">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Insights
            </Link>
          </Button>

          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-12">
              <div className="text-sm font-medium text-accent mb-4">
                {insight.category}
              </div>
              <h1 className="mb-6">{insight.title}</h1>

              <div className="flex items-center gap-4 text-sm text-subtle">
                <span>By {insight.author}</span>
                <span>•</span>
                <time dateTime={insight.date}>
                  {new Date(insight.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {insight.readTime}
                </span>
              </div>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-body leading-relaxed">{insight.excerpt}</p>
              <p className="text-body leading-relaxed">{insight.content}</p>
              
              {/* Placeholder for full article content */}
              <p className="text-body leading-relaxed mt-6">
                This is where the full article content would appear. In a production
                implementation, this would be rendered from markdown or a rich text editor,
                with proper formatting, images, and embedded media.
              </p>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default InsightDetail;
