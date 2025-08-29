import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Blog Post - Ruscles Investments",
  description: "Read our latest insights on electrical and HVAC services.",
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  // This would typically fetch the blog post data based on the slug
  const post = {
    title: "Essential Electrical Safety Tips for Homeowners in 2024",
    content: `
      <p>Electrical safety should be a top priority for every homeowner. With the increasing number of electrical devices and systems in modern homes, understanding basic electrical safety principles can prevent accidents, fires, and costly repairs.</p>
      
      <h2>1. Regular Electrical Inspections</h2>
      <p>Schedule professional electrical inspections every 3-5 years, or immediately if you notice any warning signs. Our certified electricians can identify potential hazards before they become serious problems.</p>
      
      <h2>2. Know the Warning Signs</h2>
      <ul>
        <li>Flickering or dimming lights</li>
        <li>Burning smells from outlets or switches</li>
        <li>Warm or hot outlets and switch plates</li>
        <li>Frequent circuit breaker trips</li>
        <li>Mild electrical shocks from appliances</li>
      </ul>
      
      <h2>3. Outlet Safety</h2>
      <p>Never overload outlets with too many devices. Use surge protectors for valuable electronics, and consider upgrading to GFCI outlets in bathrooms, kitchens, and outdoor areas.</p>
      
      <h2>4. Extension Cord Best Practices</h2>
      <p>Extension cords should be temporary solutions, not permanent wiring. Inspect cords regularly for damage, and never run them under carpets or through doorways where they can be damaged.</p>
      
      <h2>5. Water and Electricity Don't Mix</h2>
      <p>Keep electrical devices away from water sources. If you must use electrical equipment near water, ensure it's properly grounded and consider using GFCI protection.</p>
      
      <h2>When to Call Professionals</h2>
      <p>While some electrical maintenance can be done by homeowners, major electrical work should always be handled by licensed professionals. This includes:</p>
      <ul>
        <li>Panel upgrades or replacements</li>
        <li>New circuit installations</li>
        <li>Rewiring projects</li>
        <li>Any work involving the main electrical service</li>
      </ul>
      
      <p>At Ruscles Investments, our licensed electricians are available 24/7 for emergency electrical services. Don't take risks with electrical safety – contact us for professional assistance.</p>
    `,
    author: "Technical Team",
    date: "March 15, 2024",
    readTime: "8 min read",
    category: "Safety",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80", // Electrical safety equipment
  }

  const relatedPosts = [
    {
      title: "Signs Your Electrical Panel Needs an Upgrade",
      slug: "electrical-panel-upgrade-signs",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80", // Electrical panel
    },
    {
      title: "Smart Home Electrical Upgrades: What You Need to Know",
      slug: "smart-home-electrical-upgrades",
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=300&q=80", // Smart home technology
    },
  ]

  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        {/* Article Header */}
        <div className="mb-8">
          <Badge className="mb-4">{post.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{post.title}</h1>

          <div className="flex items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              {post.author}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {post.date}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {post.readTime}
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <Button size="sm" variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share Article
            </Button>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-8">
          <img
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg"
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Call to Action */}
        <Card className="mb-12 bg-blue-50">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Professional Electrical Services?</h3>
            <p className="text-gray-600 mb-6">
              Our licensed electricians are ready to help with all your electrical needs. Contact us for a free
              consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">Get Free Quote</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="tel:+263732591600">Call Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Related Posts */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedPosts.map((relatedPost, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src={relatedPost.image || "/placeholder.svg"}
                    alt={relatedPost.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold mb-4">{relatedPost.title}</h4>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/blog/${relatedPost.slug}`}>
                      Read More
                      <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
