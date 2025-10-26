import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { BadgeFilter } from "@/components/ui/badge-filter";
import { CustomPagination } from "@/components/ui/custom-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Overline } from "@/components/ui/typography";
import { Meta } from "@/components/seo/Meta";
import { usePortfolioSearch, usePortfolioFilterOptions } from "@/hooks/usePortfolioSearch";
import { Search, Loader2, Download, FileText, FileSpreadsheet, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { usePortfolioExport } from "@/hooks/usePortfolioExport";
import { CompanyCard } from "@/components/portfolio/CompanyCard";
import { CompanySkeleton } from "@/components/portfolio/CompanySkeleton";
import { ViewToggle } from "@/components/portfolio/ViewToggle";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 12;

const Portfolio = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const companies = dbCompanies || [];

  const sectors = filterOptions?.sectors || [];
  const stages = filterOptions?.stages || [];
  const countries = filterOptions?.countries || [];

  const isLoading = isLoadingOptions || isLoadingCompanies;
  const totalPages = Math.max(1, Math.ceil(companies.length / ITEMS_PER_PAGE));

  const activeFilterCount = [activeSector, activeStage, activeCountry].filter(Boolean).length;

  const clearFilters = () => {
    setActiveSector(null);
    setActiveStage(null);
    setActiveCountry(null);
    setCurrentPage(1);
  };

  return (
    <>
      <Meta
        title="Portfolio"
        description="Explore our portfolio of exceptional companies across technology, consumer, education, and services sectors"
        canonicalUrl={`${window.location.origin}/portfolio`}
      />

      <div className="min-h-screen">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-4xl mb-16 text-center mx-auto">
            <Overline className="mb-6">Our Portfolio</Overline>
            <h1 className="mb-6 text-5xl lg:text-6xl">
              Building Tomorrow's Digital Leaders
            </h1>
            <p className="text-lead text-xl text-muted-foreground">
              We partner with visionary entrepreneurs building exceptional companies across our core sectors.
            </p>
          </div>

          {/* Stats */}
          {!isLoading && companies.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {companies.length}+
                </div>
                <div className="text-sm text-muted-foreground">Portfolio Companies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {sectors.length}
                </div>
                <div className="text-sm text-muted-foreground">Sectors</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {countries.length}
                </div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stages.length}
                </div>
                <div className="text-sm text-muted-foreground">Stages</div>
              </div>
            </div>
          )}

          {/* Filters Row */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <ViewToggle value={viewMode} onChange={setViewMode} />

              {/* Filters Button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="ml-2" variant="secondary">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Sector</h4>
                      <div className="flex flex-wrap gap-2">
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
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Stage</h4>
                      <div className="flex flex-wrap gap-2">
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
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Country</h4>
                      <div className="flex flex-wrap gap-2">
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

                    {activeFilterCount > 0 && (
                      <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Search + Export */}
            <div className="flex gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
          </div>

          {/* Active Filters Chips */}
          {activeFilterCount > 0 && (
            <div className="flex gap-2 mb-6">
              {activeSector && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
                  onClick={() => setActiveSector(null)}
                >
                  {activeSector} <X className="ml-1 h-3 w-3" />
                </Badge>
              )}
              {activeStage && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
                  onClick={() => setActiveStage(null)}
                >
                  {activeStage} <X className="ml-1 h-3 w-3" />
                </Badge>
              )}
              {activeCountry && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
                  onClick={() => setActiveCountry(null)}
                >
                  {activeCountry} <X className="ml-1 h-3 w-3" />
                </Badge>
              )}
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className={cn(
              "mb-8",
              viewMode === 'grid'
                ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            )}>
              {[...Array(8)].map((_, i) => (
                <CompanySkeleton key={i} variant={viewMode} />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <EmptyState
              title="No companies found"
              description="Try adjusting your filters or search term"
            />
          ) : (
            <>
              <div className={cn(
                "mb-8",
                viewMode === 'grid'
                  ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              )}>
                {companies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    variant={viewMode}
                  />
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
