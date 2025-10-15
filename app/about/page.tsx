"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Users,
  Award,
  Globe,
  Heart,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/frontend/navbar";
import Footer from "@/components/frontend/footer";
import MobileNavbar from "@/components/frontend/mobile-navbar";
import { useEffect, useState } from "react";

const stats = [
  {
    number: "10K+",
    label: "Happy Customers",
    icon: <Users className="w-6 h-6" />,
  },
  {
    number: "500+",
    label: "Celebrity Partners",
    icon: <Star className="w-6 h-6" />,
  },
  {
    number: "50K+",
    label: "Messages Delivered",
    icon: <Heart className="w-6 h-6" />,
  },
  {
    number: "99%",
    label: "Satisfaction Rate",
    icon: <Award className="w-6 h-6" />,
  },
];

const values = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Authentic Connections",
    description:
      "We believe in creating genuine moments between fans and their favourite celebrities.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Trust & Safety",
    description:
      "Your privacy and security are our top priorities in every interaction.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Innovation",
    description:
      "We're constantly evolving to bring you the best celebrity experience platform.",
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Global Reach",
    description:
      "Connecting fans worldwide with celebrities from every corner of the entertainment industry.",
    color: "from-green-500 to-emerald-500",
  },
];

const team = [
  {
    name: "Sarah Chen",
    role: "CEO & Founder",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Former entertainment industry executive with 15+ years connecting talent with opportunities.",
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Tech visionary who previously built platforms used by millions of creators worldwide.",
  },
  {
    name: "Emma Thompson",
    role: "Head of Celebrity Relations",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Celebrity manager turned platform advocate, ensuring the best experience for our talent.",
  },
  {
    name: "David Kim",
    role: "Head of Product",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Product strategist focused on creating magical moments through thoughtful design.",
  },
];

// Subtle starfield component
const SubtleLuxuryStarfield = () => {
  useEffect(() => {
    const existingStarfield = document.querySelector(".starfield");
    if (existingStarfield) {
      existingStarfield.remove();
    }

    const createStar = () => {
      const star = document.createElement("div");
      const size = Math.random() * 2 + 1;
      const type = Math.random();

      if (type > 0.97) {
        star.className = "star diamond";
        star.style.width = `${size * 1.5}px`;
        star.style.height = `${size * 1.5}px`;
      } else if (type > 0.93) {
        star.className = "star sapphire";
        star.style.width = `${size * 1.2}px`;
        star.style.height = `${size * 1.2}px`;
      } else {
        star.className = "star";
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
      }

      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 5}s`;

      return star;
    };

    const starfield = document.createElement("div");
    starfield.className = "starfield";

    for (let i = 0; i < 60; i++) {
      starfield.appendChild(createStar());
    }

    document.body.appendChild(starfield);

    return () => {
      const starfieldToRemove = document.querySelector(".starfield");
      if (starfieldToRemove && document.body.contains(starfieldToRemove)) {
        document.body.removeChild(starfieldToRemove);
      }
    };
  }, []);

  return null;
};

export default function AboutPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {isMobile ? <MobileNavbar /> : <Navbar />}

      <SubtleLuxuryStarfield />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.5),transparent)]" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              About Kia Ora
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-6">
              Connecting Dreams with Reality
            </h1>
            <p className="text-xl sm:text-2xl text-purple-200 max-w-4xl mx-auto leading-relaxed">
              We're on a mission to make celebrity interactions accessible,
              authentic, and unforgettable for fans around the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="text-purple-400 mb-4 flex justify-center">
                      {stat.icon}
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-purple-200">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-purple-200 leading-relaxed">
                <p>
                  Kia Ora was born from a simple observation: fans desperately
                  wanted to connect with their heroes, but the barriers seemed
                  insurmountable. Traditional meet-and-greets were expensive,
                  exclusive, and often disappointing.
                </p>
                <p>
                  We envisioned a world where a birthday message from your
                  favourite actor, a pep talk from a sports legend, or business
                  advice from an entrepreneur was just a few clicks away. Not as
                  a distant dream, but as an accessible reality.
                </p>
                <p>
                  Today, we're proud to have facilitated thousands of magical
                  moments, turning fan dreams into cherished memories that last
                  a lifetime.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  alt="Kia Ora team"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Our Values
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              These core principles guide everything we do and every decision we
              make.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 h-full">
                  <CardContent className="p-8">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r ${value.color} flex items-center justify-center mb-6`}
                    >
                      <div className="text-white">{value.icon}</div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {value.title}
                    </h3>
                    <p className="text-purple-200 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              The passionate individuals working to make celebrity connections
              accessible to everyone.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 backdrop-blur-lg hover:bg-white/20 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-6">
                      <Image
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        width={200}
                        height={200}
                        className="w-32 h-32 rounded-full mx-auto object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {member.name}
                    </h3>
                    <p className="text-purple-400 font-medium mb-4">
                      {member.role}
                    </p>
                    <p className="text-purple-200 text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border border-white/20 rounded-3xl p-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Join Our Mission
            </h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Whether you're a fan looking for that perfect message or a
              celebrity wanting to connect with your audience, we're here to
              make it happen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-lg"
              >
                Start Connecting
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-12 py-4 text-lg"
              >
                Join as Celebrity
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
