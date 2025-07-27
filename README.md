# MOREOVER - Fashion Website

A minimalist fashion website with proper routing and navigation.

## File Structure

The website now uses separate HTML files for each page with proper routing and modular CSS:

### HTML Files
- `index.html` - Redirects to home page
- `home.html` - Home page with hero section, new arrivals, popular products, and collections
- `explore.html` - Product exploration page with search and filtering
- `collections.html` - Collections page showing all product collections
- `product.html` - Individual product detail page
- `about.html` - About page (placeholder)
- `contact.html` - Contact page (placeholder)

### JavaScript Files
- `app.js` - Main JavaScript file handling all functionality

### CSS Files (Modular Structure)
- `base.css` - Base styles, CSS variables, and global components
- `navigation.css` - Navigation bar styles
- `home.css` - Home page specific styles (hero, sections, newsletter)
- `explore.css` - Explore page specific styles (search, filters, product grid)
- `product.css` - Product detail page styles (product images, details, related products)
- `collections.css` - Collections page styles (collection cards, product grids)
- `about.css` - About page styles
- `contact.css` - Contact page styles
- `components.css` - Shared components (modals, footer, cart, etc.)

## Navigation

The website now uses proper URL-based navigation instead of show/hide functionality:

- **Home**: `home.html` or `/`
- **Explore**: `explore.html`
- **Collections**: `collections.html`
- **Product Details**: `product.html?id=PRODUCT_ID`
- **Collection Products**: `collections.html?collection=COLLECTION_NAME`
- **About**: `about.html`
- **Contact**: `contact.html`

## Features

- **Proper Routing**: Each page is a separate HTML file with its own URL
- **Product Navigation**: Click on any product to view its details
- **Collection Navigation**: Click on collections to view products within that collection
- **Search & Filter**: Available on the explore page
- **Responsive Design**: Works on all device sizes
- **Firebase Integration**: Products loaded from Firestore database

## How to Use

1. Start with `index.html` which will redirect to `home.html`
2. Navigate between pages using the navigation menu
3. Click on products to view details
4. Use the explore page to search and filter products
5. Browse collections to see curated product groups

## Technical Details

- **Routing**: Client-side routing with URL parameters
- **State Management**: Cart and user preferences stored in localStorage
- **Data Source**: Firebase Firestore for product data
- **Styling**: Modular CSS architecture with separate stylesheets for each page
- **JavaScript**: Vanilla JavaScript with modular functions
- **CSS Architecture**: 
  - Base styles and variables in `base.css`
  - Page-specific styles in dedicated files
  - Shared components in `components.css`
  - Responsive design across all breakpoints 