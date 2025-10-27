import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Meta } from "@/components/seo/Meta";
import { Loader2 } from "lucide-react";
import { useNewsSearch } from "@/hooks/useNewsSearch";
import { EmptyState } from "@/components/ui/empty-state";
import { CustomPagination } from "@/components/ui/custom-pagination";

export default function News() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;

  const { data: newsArticles, isLoading } = useNewsSearch({
    searchQuery: searchTerm || undefined,
    category: "News",
    limit: articlesPerPage,
    offset: (currentPage - 1) * articlesPerPage,
  });

  const totalPages = newsArticles && newsArticles.length === articlesPerPage 
    ? currentPage + 1 
    : currentPage;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Meta
        title="News"
        description="Latest news and updates from the Capittal Invest team"
        keywords="news, updates, announcements, press releases, investment news"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-24">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-6">
              Latest News
            </h1>
            <p className="text-lg text-body leading-relaxed">
              Stay updated with the latest announcements, press releases, and news from Capittal Invest
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-subtle/30">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <Input
              type="search"
              placeholder="Search news articles..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : newsArticles && newsArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/insights/${article.slug}`}
                    className="group"
                  >
                    <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
                      {article.featured_image_url && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={article.featured_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                          <span className="text-xs text-subtle">
                            {new Date(article.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <h3 className="font-serif text-xl mb-3 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        
                        {article.excerpt && (
                          <p className="text-sm text-body leading-relaxed mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-3 pt-4 border-t">
                          {article.author_avatar_url && (
                            <img
                              src={article.author_avatar_url}
                              alt={article.author_name}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {article.author_name}
                            </p>
                            <p className="text-xs text-subtle">
                              {article.read_time} min read
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No news articles found"
              description="Check back later for the latest updates and announcements."
            />
          )}
        </div>
      </section>
    </div>
  );
}
