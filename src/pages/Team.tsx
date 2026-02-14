// Force rebuild - display_order fix v2
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Overline } from "@/components/ui/typography";
import { Meta } from "@/components/seo/Meta";
import { Linkedin, Mail, ArrowRight, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FallbackNotice } from "@/components/ui/fallback-notice";
import { fallbackTeamMembers, TeamMember } from "@/data/fallbackData";
import { getCanonicalUrl } from "@/lib/url";

// TeamMember interface is now imported from fallbackData

const TeamMemberSkeleton = () => (
  <div>
    <Skeleton className="aspect-[4/5] w-full" />
    <div className="pt-4 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

const Team = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const { data: members, isLoading, isError } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as TeamMember[];
    },
    placeholderData: fallbackTeamMembers,
    retry: 1,
  });

  // Use fallback if no data or error
  const displayMembers = (members && members.length > 0) ? members : fallbackTeamMembers;
  const isUsingFallback = !members || members.length === 0 || isError;

  // Group members by section
  const groupedMembers = displayMembers?.reduce((acc, member) => {
    const section = member.section || 'Equipo';
    if (!acc[section]) acc[section] = [];
    acc[section].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  // Get unique sections for filters
  const sections = Object.keys(groupedMembers || {});

  // Filter members based on active filter
  const filteredMembers = activeFilter
    ? { [activeFilter]: groupedMembers?.[activeFilter] || [] }
    : groupedMembers;

  return (
    <>
      <Meta
        title="Equipo"
        description="Conoce al equipo de Capittal - profesionales comprometidos con ayudarte a alcanzar tus objetivos de M&A"
        canonicalUrl={getCanonicalUrl("/team")}
      />

      <div className="min-h-screen">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-4xl">
            <Overline className="mb-4">Equipo</Overline>
            <h1 className="mb-6">
              Juntos <em className="font-display not-italic">sumamos</em>
            </h1>
            <p className="text-lead">
              Un equipo multidisciplinar de profesionales con amplia experiencia en M&A,
              comprometidos con generar valor en cada operación.
            </p>
          </div>
        </section>

        {/* Filters */}
        {sections.length > 1 && !isUsingFallback && (
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex gap-2 flex-wrap max-w-6xl mx-auto">
              <button
                onClick={() => setActiveFilter(null)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  !activeFilter
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                Todos
              </button>
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveFilter(section)}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    activeFilter === section
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {section}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Team Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {isUsingFallback && <FallbackNotice className="mb-8 rounded-lg" />}
          
          {isLoading && !displayMembers ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[...Array(6)].map((_, i) => (
                <TeamMemberSkeleton key={i} />
              ))}
            </div>
          ) : (
            Object.entries(filteredMembers || {}).map(([section, sectionMembers]) => (
              <div key={section} className="mb-20 last:mb-0 max-w-6xl mx-auto">
                {!activeFilter && (
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
                    {section}
                  </p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {sectionMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="group cursor-pointer"
                      onClick={() => setSelectedMember(member)}
                    >
                      {/* Photo - full color with zoom effect */}
                      <div className="aspect-[4/5] overflow-hidden bg-muted mb-4">
                        {member.image_url ? (
                          <img
                            src={member.image_url}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary">
                            <span className="text-5xl font-display text-muted-foreground">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div>
                        <h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                          {member.name}
                        </h3>
                        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mt-1">
                          {member.position}
                        </p>
                        
                        {/* Bio excerpt - italic quote style */}
                        {member.bio && (
                          <p className="text-sm italic text-muted-foreground mt-3 line-clamp-2">
                            "{member.bio.substring(0, 80)}..."
                          </p>
                        )}
                        
                        {/* Ver perfil link */}
                        <span className="text-sm text-primary hover:underline mt-3 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Ver perfil <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {/* Profile Modal */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Perfil de {selectedMember?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedMember && (
            <div className="flex flex-col md:flex-row gap-8">
              {/* Photo */}
              <div className="w-full md:w-1/3 shrink-0">
                <div className="aspect-[4/5] overflow-hidden bg-muted">
                  {selectedMember.image_url ? (
                    <img
                      src={selectedMember.image_url}
                      alt={selectedMember.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <span className="text-6xl font-display text-muted-foreground">
                        {selectedMember.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-medium text-foreground mb-1">
                  {selectedMember.name}
                </h2>
                <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground mb-6">
                  {selectedMember.position}
                </p>
                
                {selectedMember.bio && (
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {selectedMember.bio}
                  </p>
                )}
                
                {/* Contact links */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  {selectedMember.email && (
                    <a
                      href={`mailto:${selectedMember.email}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </a>
                  )}
                  {selectedMember.linkedin_url && (
                    <a
                      href={selectedMember.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Team;
