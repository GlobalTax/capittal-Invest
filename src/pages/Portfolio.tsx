import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BadgeFilter } from "@/components/ui/badge-filter";
import { CustomPagination } from "@/components/ui/custom-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Meta } from "@/components/seo/Meta";
import { usePortfolioSearch, usePortfolioFilterOptions } from "@/hooks/usePortfolioSearch";
import { portfolioCompanies } from "@/data/mockData";
import { ExternalLink, Search, Loader2, Download, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePortfolioExport } from "@/hooks/usePortfolioExport";

const ITEMS_PER_PAGE = 9;

const Portfolio = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Export hook
  const { exportData, isExporting } = usePortfolioExport();

  // Fetch filter options from database
  const { data: filterOptions, isLoading: isLoadingOptions } = usePortfolioFilterOptions();

  // Fetch portfolio companies with search and filters
  const { data: dbCompanies, isLoading: isLoadingCompanies } = usePortfolioSearch({
    searchQuery: searchTerm || undefined,
    sector: activeSector || undefined,
    stage: activeStage || undefined,
    country: activeCountry || undefined,
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
  });

  // Use database data if available, otherwise fallback to mock data
  const companies = dbCompanies && dbCompanies.length > 0 
    ? dbCompanies.map(c => ({
        id: c.id,
        name: c.name,
        sector: c.sector,
        stage: c.stage,
        country: c.country,
        thesis: c.investment_thesis || c.description || "",
        website: c.website_url || "#",
      }))
    : portfolioCompanies;

  const sectors = filterOptions?.sectors || Array.from(new Set(portfolioCompanies.map((c) => c.sector)));
  const stages = filterOptions?.stages || Array.from(new Set(portfolioCompanies.map((c) => c.stage)));
  const countries = filterOptions?.countries || Array.from(new Set(portfolioCompanies.map((c) => c.country)));

  const isLoading = isLoadingOptions || isLoadingCompanies;
  const totalPages = Math.max(1, Math.ceil(companies.length / ITEMS_PER_PAGE));

  return (
    <>
      <Meta
        title="Portfolio"
        description="Explore our portfolio of exceptional companies across technology, consumer, education, and services sectors"
        canonicalUrl={`${window.location.origin}/portfolio`}
      />

      <div className="min-h-screen">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mb-12">
            <h1 className="mb-6">Portfolio Companies</h1>
            <p className="text-xl text-body">
              We partner with exceptional companies building the future across our core sectors.
            </p>
          </div>

          {/* Filters */}
          <div className="space-y-4 mb-8">
            {/* Search and Export */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
                <Input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                  aria-label="Search portfolio companies"
                />
              </div>

              {/* Export dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    disabled={isExporting || companies.length === 0}
                    aria-label="Export portfolio companies"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => exportData({
                      searchQuery: searchTerm,
                      sector: activeSector || undefined,
                      stage: activeStage || undefined,
                      country: activeCountry || undefined,
                    }, 'csv')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => exportData({
                      searchQuery: searchTerm,
                      sector: activeSector || undefined,
                      stage: activeStage || undefined,
                      country: activeCountry || undefined,
                    }, 'excel')}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Filter badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-subtle">Sector:</span>
                {sectors.map((sector) => (
                  <BadgeFilter
                    key={sector}
                    label={sector}
                    active={activeSector === sector}
                    onClick={() => {
                      setActiveSector(activeSector === sector ? null : sector);
                      setCurrentPage(1);
                    }}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-subtle">Stage:</span>
                {stages.map((stage) => (
                  <BadgeFilter
                    key={stage}
                    label={stage}
                    active={activeStage === stage}
                    onClick={() => {
                      setActiveStage(activeStage === stage ? null : stage);
                      setCurrentPage(1);
                    }}
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-subtle">Country:</span>
                {countries.map((country) => (
                  <BadgeFilter
                    key={country}
                    label={country}
                    active={activeCountry === country}
                    onClick={() => {
                      setActiveCountry(activeCountry === country ? null : country);
                      setCurrentPage(1);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : companies.length === 0 ? (
            <EmptyState
              title="No companies found"
              description="Try adjusting your filters or search term"
            />
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {companies.map((company) => (
                  <Card
                    key={company.id}
                    className="p-6 hover:shadow-lg transition-smooth"
                  >
                    <div className="flex flex-col h-full">
                      <div className="mb-4">
                        <h3 className="text-xl mb-2">{company.name}</h3>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 bg-secondary rounded text-body">
                            {company.sector}
                          </span>
                          <span className="px-2 py-1 bg-secondary rounded text-body">
                            {company.country}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-body mb-4 flex-grow">
                        {company.thesis}
                      </p>

                      <div className="flex items-center gap-4">
                        <Link
                          to={`/portfolio/${company.id}`}
                          className="text-sm font-medium text-primary hover:text-accent transition-smooth"
                        >
                          View details
                        </Link>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-subtle hover:text-body transition-smooth inline-flex items-center gap-1"
                          aria-label={`Visit ${company.name} website`}
                        >
                          Website <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
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

export default Portfolio;
