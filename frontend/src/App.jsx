import React, { useState, useEffect, createContext, useContext } from 'react';

const API_URL = 'http://localhost:5003';

// Auth Context to share login state across components
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// Simple routing system
function App() {
  const [currentPage, setCurrentPage] = useState('products');
  
  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          {currentPage === 'login' && <LoginPage setCurrentPage={setCurrentPage} />}
          {currentPage === 'register' && <RegisterPage setCurrentPage={setCurrentPage} />}
          {currentPage === 'products' && <ProductsPage />}
          {currentPage === 'cart' && <CartPage />}
        </div>
      </div>
    </AuthProvider>
  );
}

// Navigation bar
function Navigation({ currentPage, setCurrentPage }) {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav style={{
      backgroundColor: '#2c3e50',
      padding: '1rem 2rem',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>My Shop</h1>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            <button onClick={() => setCurrentPage('products')} style={navButtonStyle(currentPage === 'products')}>
              Products
            </button>
            <button onClick={() => setCurrentPage('cart')} style={navButtonStyle(currentPage === 'cart')}>
              Cart
            </button>
            <span style={{ marginLeft: '1rem', fontSize: '0.9rem' }}>{user?.email}</span>
            <button onClick={() => { logout(); setCurrentPage('login'); }} style={navButtonStyle(false)}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setCurrentPage('login')} style={navButtonStyle(currentPage === 'login')}>
              Login
            </button>
            <button onClick={() => setCurrentPage('register')} style={navButtonStyle(currentPage === 'register')}>
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const navButtonStyle = (active) => ({
  backgroundColor: active ? '#34495e' : 'transparent',
  color: 'white',
  border: 'none',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  borderRadius: '4px',
  fontSize: '1rem'
});

// Login Page
function LoginPage({ setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async () => {
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        setCurrentPage('products');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Is your backend running?');
    }
  };

  return (
    <div style={formContainerStyle}>
      <h2>Login</h2>
      <div style={formStyle}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        {error && <p style={{ color: 'red', margin: '0.5rem 0' }}>{error}</p>}
        <button onClick={handleSubmit} style={buttonStyle}>Login</button>
      </div>
      <p style={{ marginTop: '1rem' }}>
        Don't have an account?{' '}
        <button onClick={() => setCurrentPage('register')} style={linkButtonStyle}>
          Register here
        </button>
      </p>
    </div>
  );
}

// Register Page
function RegisterPage({ setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async () => {
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, { email });
        setCurrentPage('products');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Is your backend running?');
    }
  };

  return (
    <div style={formContainerStyle}>
      <h2>Register</h2>
      <div style={formStyle}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        {error && <p style={{ color: 'red', margin: '0.5rem 0' }}>{error}</p>}
        <button onClick={handleSubmit} style={buttonStyle}>Register</button>
      </div>
      <p style={{ marginTop: '1rem' }}>
        Already have an account?{' '}
        <button onClick={() => setCurrentPage('login')} style={linkButtonStyle}>
          Login here
        </button>
      </p>
    </div>
  );
}

// Products Page
function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const url = search 
        ? `${API_URL}/shopping/products?search=${encodeURIComponent(search)}`
        : `${API_URL}/shopping/products`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': token }
      });

      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/shopping/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✓ ${data.cartItem.product.name} added to cart!`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('Error adding to cart');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={formContainerStyle}>
        <h2>Please login to view products</h2>
      </div>
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: '400px' }}
        />
      </div>

      {message && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {message}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        {products.map(product => (
          <div key={product.id} style={productCardStyle}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60', margin: '0.5rem 0' }}>
              ${Number(product.price).toFixed(2)}
            </p>
            <button onClick={() => addToCart(product.id)} style={buttonStyle}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
          No products found
        </p>
      )}
    </div>
  );
}

// Cart Page
function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_URL}/shopping/cart`, {
        headers: { 'Authorization': token }
      });

      const data = await response.json();
      setCart(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await fetch(`${API_URL}/shopping/cart/item/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const clearCart = async () => {
    try {
      await fetch(`${API_URL}/shopping/cart`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      fetchCart();
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={formContainerStyle}>
        <h2>Please login to view your cart</h2>
      </div>
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading cart...</div>;
  }

  if (!cart || cart.cart.items.length === 0) {
    return (
      <div style={formContainerStyle}>
        <h2>Your cart is empty</h2>
        <p>Add some products to get started!</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Your Cart ({cart.itemCount} items)</h2>
        <button onClick={clearCart} style={{ ...buttonStyle, backgroundColor: '#e74c3c' }}>
          Clear Cart
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem' }}>
        {cart.cart.items.map(item => (
          <div key={item.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 0',
            borderBottom: '1px solid #eee'
          }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.product.name}</h3>
              <p style={{ margin: 0, color: '#666' }}>
                ${Number(item.product.price).toFixed(2)} × {item.quantity} = 
                ${(Number(item.product.price) * item.quantity).toFixed(2)}
              </p>
            </div>
            <button onClick={() => removeItem(item.id)} style={{ ...buttonStyle, backgroundColor: '#e74c3c' }}>
              Remove
            </button>
          </div>
        ))}

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <h2 style={{ margin: 0 }}>Total: ${cart.total}</h2>
          <button style={{ ...buttonStyle, marginTop: '1rem', fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

// Shared styles
const formContainerStyle = {
  maxWidth: '400px',
  margin: '2rem auto',
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};

const inputStyle = {
  padding: '0.75rem',
  fontSize: '1rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  width: '100%',
  boxSizing: 'border-box'
};

const buttonStyle = {
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};

const linkButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#3498db',
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: 'inherit'
};

const productCardStyle = {
  backgroundColor: 'white',
  padding: '1.5rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column'
};

export default App;