import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BadgeFilter } from "@/components/ui/badge-filter";
import { CustomPagination } from "@/components/ui/custom-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Overline } from "@/components/ui/typography";
import { Meta } from "@/components/seo/Meta";
import { useNewsSearch, useNewsFilterOptions } from "@/hooks/useNewsSearch";
import { insights } from "@/data/mockData";
import { ArrowRight, Search, Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 6;

const Insights = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch filter options from database
  const { data: filterOptions, isLoading: isLoadingOptions } = useNewsFilterOptions();

  // Fetch news articles with search and filters
  const { data: dbArticles, isLoading: isLoadingArticles } = useNewsSearch({
    searchQuery: searchTerm || undefined,
    category: activeCategory || undefined,
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
  });

  // Use database data if available, otherwise fallback to mock data
  const articles = dbArticles && dbArticles.length > 0
    ? dbArticles.map(a => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt || "",
        category: a.category,
        author: a.author_name,
        date: new Date(a.published_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }))
    : insights;

  const categories = filterOptions?.categories || Array.from(new Set(insights.map((i) => i.category)));
  const isLoading = isLoadingOptions || isLoadingArticles;
  const totalPages = Math.max(1, Math.ceil(articles.length / ITEMS_PER_PAGE));

  return (
    <>
      <Meta
        title="Insights"
        description="Perspectives on investing, building, and scaling exceptional businesses from the Ethos Ventures team"
        canonicalUrl={`${window.location.origin}/insights`}
      />

      <div className="min-h-screen">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mb-12">
            <Overline className="mb-4">Insights</Overline>
            <h1 className="mb-6">Latest Insights</h1>
            <p className="text-lead">
              Perspectives on investing, building, and scaling exceptional businesses
            </p>
          </div>

          {/* Filters */}
          <div className="space-y-4 mb-8">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
              <Input
                type="text"
                placeholder="Search insights..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
                aria-label="Search insights"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-subtle">Category:</span>
              {categories.map((category) => (
                <BadgeFilter
                  key={category}
                  label={category}
                  active={activeCategory === category}
                  onClick={() => {
                    setActiveCategory(activeCategory === category ? null : category);
                    setCurrentPage(1);
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Articles */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : articles.length === 0 ? (
            <EmptyState
              title="No insights found"
              description="Try adjusting your filters or search term"
            />
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mb-8">
                {articles.map((insight) => (
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

              {totalPages > 1 && (
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
};

export default Insights;
