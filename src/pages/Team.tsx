import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Overline } from "@/components/ui/typography";
import { Meta } from "@/components/seo/Meta";
import { Linkedin, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMember {
  id: string;
  name: string;
  position: string;
  email: string | null;
  linkedin_url: string | null;
  image_url: string | null;
  bio: string | null;
  section: string | null;
  display_order: number;
}

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
  const { data: members, isLoading } = useQuery({
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
  });

  // Group members by section
  const groupedMembers = members?.reduce((acc, member) => {
    const section = member.section || 'Equipo';
    if (!acc[section]) acc[section] = [];
    acc[section].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  return (
    <>
      <Meta
        title="Equipo"
        description="Conoce al equipo de Capittal - profesionales comprometidos con ayudarte a alcanzar tus objetivos de M&A"
        canonicalUrl={`${window.location.origin}/team`}
      />

      <div className="min-h-screen">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-4xl">
            <Overline className="mb-4">Equipo</Overline>
            <h1 className="mb-6">Nuestro Equipo</h1>
            <p className="text-lead">
              Un equipo de profesionales expertos en M&A y asesoría financiera,
              comprometidos con ayudarte a alcanzar tus objetivos empresariales.
            </p>
          </div>
        </section>

        {/* Team Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
              {[...Array(6)].map((_, i) => (
                <TeamMemberSkeleton key={i} />
              ))}
            </div>
          ) : (
            Object.entries(groupedMembers || {}).map(([section, sectionMembers]) => (
              <div key={section} className="mb-20 last:mb-0">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">{section}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {sectionMembers.map((member) => (
                    <div key={member.id} className="group cursor-pointer">
                      {/* Photo with zoom effect */}
                      <div className="aspect-[4/5] overflow-hidden bg-muted mb-4">
                        {member.image_url ? (
                          <img
                            src={member.image_url}
                            alt={member.name}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary grayscale group-hover:grayscale-0 transition-all duration-500">
                            <span className="text-5xl font-serif text-muted-foreground">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Info - minimal style with fixed height for alignment */}
                      <div className="min-h-[72px]">
                        <h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                          {member.name}
                        </h3>
                        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mt-1 line-clamp-2">
                          {member.position}
                        </p>
                        
                        {/* Icons - appear on hover with fixed height */}
                        <div className="h-8 flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              aria-label={`Email ${member.name}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                          {member.linkedin_url && (
                            <a
                              href={member.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                              aria-label={`${member.name}'s LinkedIn profile`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
};

export default Team;
