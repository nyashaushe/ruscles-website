import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Blog & Industry Insights - Ruscles Investments",
  description:
    "Stay updated with the latest electrical and HVAC industry news, tips, and insights from our professional team at Ruscles Investments.",
}

export default function BlogPage() {
  const featuredPost = {
    title: "Essential Electrical Safety Tips for Homeowners in 2024",
    excerpt:
      "Learn the most important electrical safety practices every homeowner should know to protect their family and property from electrical hazards.",
    author: "Technical Team",
    date: "March 15, 2024",
    readTime: "8 min read",
    category: "Safety",
    image: "/placeholder.svg?height=400&width=600",
    slug: "electrical-safety-tips-homeowners-2024",
  }

  const blogPosts = [
    {
      title: "How to Choose the Right Air Conditioning System for Your Home",
      excerpt:
        "A comprehensive guide to selecting the perfect AC system based on your home size, budget, and energy efficiency needs.",
      author: "HVAC Specialists",
      date: "March 10, 2024",
      readTime: "6 min read",
      category: "HVAC",
      image: "/placeholder.svg?height=300&width=400",
      slug: "choose-right-air-conditioning-system",
    },
    {
      title: "Signs Your Electrical Panel Needs an Upgrade",
      excerpt:
        "Discover the warning signs that indicate your electrical panel needs upgrading and why it's crucial for your home's safety.",
      author: "Electrical Team",
      date: "March 5, 2024",
      readTime: "5 min read",
      category: "Electrical",
      image: "/placeholder.svg?height=300&width=400",
      slug: "electrical-panel-upgrade-signs",
    },
    {
      title: "Energy-Efficient Refrigeration Solutions for Businesses",
      excerpt:
        "Learn how modern refrigeration technology can reduce your business's energy costs while maintaining optimal performance.",
      author: "Commercial Team",
      date: "February 28, 2024",
      readTime: "7 min read",
      category: "Commercial",
      image: "/placeholder.svg?height=300&width=400",
      slug: "energy-efficient-refrigeration-businesses",
    },
    {
      title: "Cold Room Maintenance: Best Practices for Optimal Performance",
      excerpt:
        "Essential maintenance tips to keep your cold room operating efficiently and extend its lifespan while reducing costs.",
      author: "Refrigeration Experts",
      date: "February 20, 2024",
      readTime: "6 min read",
      category: "Maintenance",
      image: "/placeholder.svg?height=300&width=400",
      slug: "cold-room-maintenance-best-practices",
    },
    {
      title: "Smart Home Electrical Upgrades: What You Need to Know",
      excerpt:
        "Explore the electrical requirements for smart home technology and how to prepare your home for the future.",
      author: "Smart Home Team",
      date: "February 15, 2024",
      readTime: "8 min read",
      category: "Technology",
      image: "/placeholder.svg?height=300&width=400",
      slug: "smart-home-electrical-upgrades",
    },
    {
      title: "Emergency HVAC Repairs: When to Call the Professionals",
      excerpt:
        "Understand when HVAC issues require immediate professional attention and how to handle emergency situations safely.",
      author: "Emergency Team",
      date: "February 10, 2024",
      readTime: "5 min read",
      category: "Emergency",
      image: "/placeholder.svg?height=300&width=400",
      slug: "emergency-hvac-repairs-when-to-call",
    },
  ]

  const categories = ["All", "Electrical", "HVAC", "Safety", "Maintenance", "Commercial", "Technology", "Emergency"]

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Industry Insights & Tips</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest electrical and HVAC industry news, expert tips, and professional insights from
            our experienced team.
          </p>
        </div>

        {/* Featured Post */}
        <Card className="mb-16 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="relative h-64 lg:h-auto">
              <img
                src={featuredPost.image || "/placeholder.svg"}
                alt={featuredPost.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-orange-500">{featuredPost.category}</Badge>
              </div>
            </div>
            <div className="p-8">
              <div className="mb-4">
                <Badge variant="secondary">Featured Post</Badge>
              </div>
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl lg:text-3xl mb-3">{featuredPost.title}</CardTitle>
                <CardDescription className="text-base">{featuredPost.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {featuredPost.date}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {featuredPost.readTime}
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/blog/${featuredPost.slug}`}>
                    Read Full Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </div>
          </div>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {categories.map((category) => (
            <Button key={category} variant={category === "All" ? "default" : "outline"} size="sm" className="mb-2">
              {category}
            </Button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {blogPosts.map((post, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <div className="relative h-48">
                <img
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary">{post.category}</Badge>
                </div>
              </div>
              <CardHeader className="flex-1">
                <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 mt-auto">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {post.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {post.date}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{post.readTime}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/blog/${post.slug}`}>
                      Read More
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-blue-900 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-6 text-blue-100">
            Subscribe to our newsletter for the latest industry insights, tips, and company updates.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-2 rounded-lg text-gray-900" />
            <Button className="bg-orange-500 hover:bg-orange-600">Subscribe</Button>
          </div>
          <p className="text-sm text-blue-200 mt-4">We respect your privacy. Unsubscribe at any time.</p>
        </div>

        {/* Popular Topics */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Popular Topics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center bg-transparent">
              <span className="font-semibold">Electrical Safety</span>
              <span className="text-sm text-gray-500">12 articles</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center bg-transparent">
              <span className="font-semibold">HVAC Maintenance</span>
              <span className="text-sm text-gray-500">8 articles</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center bg-transparent">
              <span className="font-semibold">Energy Efficiency</span>
              <span className="text-sm text-gray-500">10 articles</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center bg-transparent">
              <span className="font-semibold">Smart Home Tech</span>
              <span className="text-sm text-gray-500">6 articles</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
