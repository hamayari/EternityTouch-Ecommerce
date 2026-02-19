import React, { useState, useContext, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import SEO from '../components/SEO';
import { ProductCardSkeleton } from '../components/LoadingState';
import NetworkError from '../components/NetworkError';
import { 
  Slider, 
  FormControlLabel, 
  Checkbox, 
  Radio, 
  RadioGroup, 
  FormControl, 
  FormLabel,
  Chip,
  Box,
  Typography,
  Divider
} from '@mui/material';


const Collection = () => {
  const {products, search, showSearch} = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subcategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');
  const [isLoading, setIsLoading] = useState(true); // ✅ Loading state
  const [hasError, setHasError] = useState(false); // ✅ Error state
  
  // Advanced filters
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  // Get price range from products
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.price);
      const maxPrice = Math.max(...prices);
      setPriceRange([0, maxPrice]);
      setIsLoading(false); // ✅ Products loaded
      setHasError(false);
    } else if (products.length === 0) {
      // ✅ Check if it's actually loading or an error
      const timer = setTimeout(() => {
        if (products.length === 0) {
          setIsLoading(false);
        }
      }, 3000); // Wait 3 seconds before showing empty state
      
      return () => clearTimeout(timer);
    }
  }, [products]);

  const toggleCategory = (e) => {
    if(category.includes(e.target.value)){
      setCategory(prev => prev.filter(item => item !== e.target.value));
    }
    else{
      setCategory(prev => [...prev, e.target.value])
    }
  }

  const toggleSubCategory = (e) => {
    if(subCategory.includes(e.target.value)){
      setSubCategory(prev => prev.filter(item => item !== e.target.value));
    }
    else{
      setSubCategory(prev => [...prev, e.target.value])
    }
  }

  const applyFilter = () => {
    let productsCopy = products.slice();
    
    // Search filter
    if(showSearch && search){
      productsCopy = productsCopy.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Category filter
    if(category.length > 0){
      productsCopy = productsCopy.filter(item => category.includes(item.category))
    }
    
    // Subcategory filter
    if(subcategory.length > 0){
      productsCopy = productsCopy.filter(item => subcategory.includes(item.subcategory))
    }
    
    // Price range filter
    productsCopy = productsCopy.filter(item => 
      item.price >= priceRange[0] && item.price <= priceRange[1]
    );
    
    // Rating filter
    if(minRating > 0){
      productsCopy = productsCopy.filter(item => 
        (item.averageRating || 0) >= minRating
      );
    }
    
    // In stock filter
    if(inStockOnly){
      productsCopy = productsCopy.filter(item => 
        item.stock > 0
      );
    }
    
    // On sale filter
    if(onSaleOnly){
      productsCopy = productsCopy.filter(item => 
        item.discount > 0
      );
    }
    
    setFilterProducts(productsCopy)
  }

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();
    switch (sortType){
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>(a.price-b.price)));
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>(b.price-a.price)));
        break;
      case 'popular':
        setFilterProducts(fpCopy.sort((a,b)=>(b.totalReviews || 0)-(a.totalReviews || 0)));
        break;
      case 'rating':
        setFilterProducts(fpCopy.sort((a,b)=>(b.averageRating || 0)-(a.averageRating || 0)));
        break;
      case 'newest':
        setFilterProducts(fpCopy.sort((a,b)=>b.date-a.date));
        break;
      default:
        applyFilter();
        break;
    }
  }
  
  useEffect(()=>{
    applyFilter();
  }, [category, subcategory, search, showSearch, products, priceRange, minRating, inStockOnly, onSaleOnly])
  
  useEffect(()=>{
    sortProduct();
  }, [sortType])
  
  const clearFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setPriceRange([0, 1000]);
    setMinRating(0);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSortType('relevant');
  };
  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      <SEO 
        title="Shop Collection"
        description="Browse our complete collection of premium fashion items. Filter by category, type, and price to find your perfect style."
        keywords="fashion collection, shop online, men fashion, women fashion, kids fashion, clothing store"
      />
      {/*Filter options */}
      <div className='min-w-60'> 
      <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS</p> 
      <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
      {/* Category Filter */} 
      <div className={`border border-gray-300 p1-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}> 
        <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
        <div className='flex flex-col gap-2 tex-sm font-ligh text-gray-700'>
          <p className='flex gap-2'>
            <input className='w-3' type="checkbox" onChange={toggleCategory} value={'Men'}/>Men
          </p>
          <p className='flex gap-2'>
            <input className='w-3' type="checkbox" onChange={toggleCategory} value={'Women'}/>Women
          </p>
          <p className='flex gap-2'>
            <input className='w-3' type="checkbox" onChange={toggleCategory} value={'Kids'}/>Kids
          </p>
        </div>
      </div>
      {/* Subcategory filters */}
      <div className={`border border-gray-300 p1-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}> 
        <p className='mb-3 text-sm font-medium'>TYPE</p>
        <div className='flex flex-col gap-2 tex-sm font-ligh text-gray-700'>
          <p className='flex gap-2'>
            <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Topwear'}/>Topwear
          </p>
          <p className='flex gap-2'>
            <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Bottomwear'}/>Bottomwear
          </p>
          <p className='flex gap-2'>
            <input className='w-3' type="checkbox" onChange={toggleSubCategory} value={'Winterwear'}/>Winterwear
          </p>
        </div>
      </div>

      {/* Price Range Filter - Material-UI */}
      <div className={`border border-gray-300 p-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          PRICE RANGE
        </Typography>
        <Box sx={{ px: 1 }}>
          <Slider
            value={priceRange}
            onChange={(e, newValue) => setPriceRange(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={1000}
            sx={{ color: 'black' }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption">${priceRange[0]}</Typography>
            <Typography variant="caption">${priceRange[1]}</Typography>
          </Box>
        </Box>
      </div>

      {/* Rating Filter - Material-UI */}
      <div className={`border border-gray-300 p-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          MINIMUM RATING
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
            <FormControlLabel value={0} control={<Radio size="small" />} label="All Ratings" />
            <FormControlLabel value={4} control={<Radio size="small" />} label="4★ & Above" />
            <FormControlLabel value={3} control={<Radio size="small" />} label="3★ & Above" />
          </RadioGroup>
        </FormControl>
      </div>

      {/* Availability Filter - Material-UI */}
      <div className={`border border-gray-300 p-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          AVAILABILITY
        </Typography>
        <FormControlLabel
          control={
            <Checkbox 
              checked={inStockOnly} 
              onChange={(e) => setInStockOnly(e.target.checked)}
              size="small"
            />
          }
          label="In Stock Only"
        />
        <br />
        <FormControlLabel
          control={
            <Checkbox 
              checked={onSaleOnly} 
              onChange={(e) => setOnSaleOnly(e.target.checked)}
              size="small"
            />
          }
          label="On Sale Only"
        />
      </div>

      {/* Clear Filters Button */}
      <div className={`mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
        <button 
          onClick={clearFilters}
          className='w-full border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 transition-colors'
        >
          Clear All Filters
        </button>
      </div>

      </div>
      {/*Right side */}
      <div className='flex-1'>
        <div className='flex justify-between items-center text-base sm:text-2xl mb-4'>
          <div>
            <Title text1={'ALL'} text2={'COLLECTIONS'}></Title>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {filterProducts.length} products found
            </Typography>
          </div>
          {/*Product sort */}
          <select onChange={(e)=>setSortType(e.target.value)} value={sortType} className="border-2 border-gray-300 text-sm px-2 py-1" >
            <option value="relevant">Sort by: Relevant</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Active Filters Chips */}
        {(category.length > 0 || subcategory.length > 0 || minRating > 0 || inStockOnly || onSaleOnly) && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {category.map(cat => (
              <Chip 
                key={cat} 
                label={cat} 
                onDelete={() => setCategory(prev => prev.filter(c => c !== cat))}
                size="small"
              />
            ))}
            {subcategory.map(sub => (
              <Chip 
                key={sub} 
                label={sub} 
                onDelete={() => setSubCategory(prev => prev.filter(s => s !== sub))}
                size="small"
              />
            ))}
            {minRating > 0 && (
              <Chip 
                label={`${minRating}★ & Above`} 
                onDelete={() => setMinRating(0)}
                size="small"
              />
            )}
            {inStockOnly && (
              <Chip 
                label="In Stock" 
                onDelete={() => setInStockOnly(false)}
                size="small"
              />
            )}
            {onSaleOnly && (
              <Chip 
                label="On Sale" 
                onDelete={() => setOnSaleOnly(false)}
                size="small"
              />
            )}
          </Box>
        )}

        {/*Map Products */}
        {isLoading ? (
          // ✅ Show skeleton while loading
          <ProductCardSkeleton count={8} />
        ) : filterProducts.length === 0 ? (
          // ✅ Show empty state
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              textAlign: 'center',
              color: 'text.secondary',
              gridColumn: '1 / -1'
            }}
          >
            <Box sx={{ fontSize: 80, mb: 2 }}>🔍</Box>
            <Typography variant="h6" gutterBottom>
              No products found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Try adjusting your filters or search terms
            </Typography>
            <button 
              onClick={clearFilters}
              className='border border-gray-300 px-6 py-2 text-sm hover:bg-gray-100 transition-colors'
            >
              Clear All Filters
            </button>
          </Box>
        ) : (
          // ✅ Show products
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
            {filterProducts.map((item, index)=>(
              <ProductItem 
                key={index} 
                name={item.name} 
                id={item._id} 
                price={item.price} 
                image={item.images}
                stock={item.stock}
                averageRating={item.averageRating}
                totalReviews={item.totalReviews}
                discount={item.discount}
                discountEndDate={item.discountEndDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Collection;
