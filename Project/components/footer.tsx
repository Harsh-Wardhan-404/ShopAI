export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About shop.ai</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</a></li>
              <li><a href="/sustainability" className="text-sm text-muted-foreground hover:text-foreground">Sustainability</a></li>
              <li><a href="/impact" className="text-sm text-muted-foreground hover:text-foreground">Environmental Impact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><a href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact Us</a></li>
              <li><a href="/shipping" className="text-sm text-muted-foreground hover:text-foreground">Shipping Info</a></li>
              <li><a href="/returns" className="text-sm text-muted-foreground hover:text-foreground">Returns</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
              <li><a href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">Stay updated with our sustainable products and initiatives.</p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2025 shop.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}