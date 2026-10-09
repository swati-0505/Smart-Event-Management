const CATEGORY_IMAGES = {
  "Tech Conference": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=85",
  "Technology": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=85",
  "Workshop": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=85",
  "Networking": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=85",
  "Corporate Event": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85",
  "Business": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85",
  "Cultural": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",
  "International": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",
  "Office": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=85",
  "Personal": "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=85",
  "Holiday": "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=900&q=85",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=85";

export function getEventImageUrl(event) {
  if (!event) return DEFAULT_IMAGE;
  if (event.image || event.image_url) return event.image || event.image_url;
  if (event.category && CATEGORY_IMAGES[event.category]) {
    return CATEGORY_IMAGES[event.category];
  }
  
  
  const catLower = (event.category || "").toLowerCase();
  if (catLower.includes("tech") || catLower.includes("code") || catLower.includes("ai")) {
    return CATEGORY_IMAGES["Technology"];
  }
  if (catLower.includes("work") || catLower.includes("learn") || catLower.includes("train")) {
    return CATEGORY_IMAGES["Workshop"];
  }
  if (catLower.includes("bus") || catLower.includes("corp")) {
    return CATEGORY_IMAGES["Business"];
  }
  if (catLower.includes("cult") || catLower.includes("art") || catLower.includes("music")) {
    return CATEGORY_IMAGES["Cultural"];
  }

  return DEFAULT_IMAGE;
}
