/**
 * Static asset service providing high-quality stock images 
 * to avoid AI generation quota limits.
 */

export async function generateCreativeAssets() {
  // Using local assets uploaded by the user
  const assets: Record<string, string> = {
    // Local background image
    hero_bg: "/main-background.jpeg",
    
    // Local character images with transparent backgrounds
    hero_subject_woman: "/woman-1.png", 
    hero_subject_man: "/man-1.png", 
    
    // Abstract geometric/floral accents for the top layer
    hero_accents: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1080",
    
    // Lush green hills/landscape (evoking Rwanda's "Land of a Thousand Hills")
    travel: "https://images.unsplash.com/photo-1589908000350-0962e5a5133b?auto=format&fit=crop&q=80&w=1080",
    
    // Traditional African textiles/crafts
    local: "https://images.unsplash.com/photo-1517147177326-b37599372b73?auto=format&fit=crop&q=80&w=1080",
    
    // Artistic/Renaissance abstract painting
    abstract: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1080"
  };

  // Simulate a small delay for the loading state to feel natural
  await new Promise(resolve => setTimeout(resolve, 800));

  return assets;
}
