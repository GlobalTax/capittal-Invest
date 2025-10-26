import { Card } from "@/components/ui/card";
import { Overline } from "@/components/ui/typography";
import { Meta } from "@/components/seo/Meta";
import { teamMembers } from "@/data/mockData";
import { Linkedin } from "lucide-react";

const Team = () => {
  return (
    <>
      <Meta
        title="Team"
        description="Meet the Ethos Ventures team - experienced investors committed to building exceptional companies"
        canonicalUrl={`${window.location.origin}/team`}
      />

      <div className="min-h-screen">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-4xl">
            <Overline className="mb-4">Team</Overline>
            <h1 className="mb-6">Our Team</h1>
            <p className="text-lead">
              We're a team of experienced investors, operators, and advisors committed
              to partnering with exceptional founders and management teams.
            </p>
          </div>
        </section>

        {/* Team Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
            {teamMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden group">
                {/* Avatar placeholder with b/w → color hover */}
                <div className="aspect-square bg-neutral-100 grayscale group-hover:grayscale-0 transition-smooth" />
                
                <div className="p-6">
                  <h3 className="text-xl font-serif mb-1">{member.name}</h3>
                  <p className="text-sm text-accent font-medium mb-4">{member.role}</p>
                  <p className="text-sm text-body leading-relaxed mb-6">{member.bio}</p>
                  
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent transition-smooth"
                    aria-label={`${member.name}'s LinkedIn profile`}
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default Team;
