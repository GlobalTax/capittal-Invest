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
  <Card className="overflow-hidden">
    <Skeleton className="aspect-square" />
    <div className="p-6 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-16 w-full" />
    </div>
  </Card>
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
              <div key={section} className="mb-16 last:mb-0">
                <h2 className="text-2xl font-serif mb-8 text-foreground">{section}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
                  {sectionMembers.map((member) => (
                    <Card key={member.id} className="overflow-hidden group">
                      {/* Avatar with b/w → color hover */}
                      <div className="aspect-square bg-muted grayscale group-hover:grayscale-0 transition-smooth overflow-hidden">
                        {member.image_url ? (
                          <img
                            src={member.image_url}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary">
                            <span className="text-4xl font-serif text-muted-foreground">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-serif mb-1 text-foreground">{member.name}</h3>
                        <p className="text-sm text-accent font-medium mb-4">{member.position}</p>
                        {member.bio && (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-6">{member.bio}</p>
                        )}
                        
                        <div className="flex items-center gap-4">
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent transition-smooth"
                              aria-label={`Email ${member.name}`}
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                          {member.linkedin_url && (
                            <a
                              href={member.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent transition-smooth"
                              aria-label={`${member.name}'s LinkedIn profile`}
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
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
