const menuItems = {
  items: [
    {
      id: 'navigation',
      title: 'Navigation',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          icon: 'feather icon-home',
          url: '/'
        },
        {
          id: 'products',
          title: 'Products',
          type: 'collapse',
          icon: 'feather icon-package',
          children: [
            {
              id: 'add-product',
              title: 'Add Product',
              type: 'item',
              url: '/add'
            },
            {
              id: 'list-products',
              title: 'Product List',
              type: 'item',
              url: '/list'
            },
            {
              id: 'stock-management',
              title: 'Stock Management',
              type: 'item',
              url: '/stock'
            }
          ]
        },
        {
          id: 'orders',
          title: 'Orders',
          type: 'item',
          icon: 'feather icon-shopping-cart',
          url: '/order'
        },
        {
          id: 'abandoned-carts',
          title: 'Abandoned Carts',
          type: 'item',
          icon: 'feather icon-shopping-bag',
          url: '/abandoned-carts'
        },
        {
          id: 'returns',
          title: 'Returns',
          type: 'item',
          icon: 'feather icon-rotate-ccw',
          url: '/returns'
        },
        {
          id: 'chat',
          title: 'Live Chat',
          type: 'item',
          icon: 'feather icon-message-circle',
          url: '/chat'
        },
        {
          id: 'loyalty',
          title: 'Loyalty Program',
          type: 'item',
          icon: 'feather icon-award',
          url: '/loyalty'
        },
        {
          id: 'qa',
          title: 'Product Q&A',
          type: 'item',
          icon: 'feather icon-help-circle',
          url: '/qa'
        },
        {
          id: 'coupons',
          title: 'Coupons',
          type: 'item',
          icon: 'feather icon-tag',
          url: '/coupons'
        },
        {
          id: 'recommendations',
          title: 'Recommendations',
          type: 'item',
          icon: 'feather icon-star',
          url: '/recommendations'
        }
      ]
    }
  ]
};

export default menuItems;
