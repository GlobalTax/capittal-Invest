import { Card } from "@/components/ui/card";
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
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-4xl">
            <h1 className="mb-6">Our Team</h1>
            <p className="text-xl text-body">
              We're a team of experienced investors, operators, and advisors committed
              to partnering with exceptional founders and management teams.
            </p>
          </div>
        </section>

        {/* Team Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
            {teamMembers.map((member) => (
              <Card key={member.id} className="p-6 hover:shadow-lg transition-smooth">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-xl mb-1">{member.name}</h3>
                    <p className="text-sm text-primary font-medium">{member.role}</p>
                  </div>

                  <p className="text-sm text-body mb-4 flex-grow">{member.bio}</p>

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
