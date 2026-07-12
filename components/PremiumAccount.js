'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  Package, Heart, User, MapPin, CreditCard, Bell, HelpCircle, 
  Settings, LogOut, Trash2, Plus, Check, ChevronRight, Sliders,
  Clock, Shield, Mail, Phone, Lock, Edit, Eye, EyeOff, Tag, Award,
  Search, Truck, Download, Printer, X, FileText, ShoppingBag, Info
} from 'lucide-react'

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN')

// Helper to determine the current progress stage index of an order
const getOrderStatusIndex = (status) => {
  if (!status) return 1; // Default to Confirmed
  const s = status.toLowerCase();
  if (s === 'cancelled') return -1;
  if (s === 'delivered') return 5;
  if (s === 'out-for-delivery' || s === 'out_for_delivery' || s === 'out for delivery') return 4;
  if (s === 'shipped') return 3;
  if (s === 'packed') return 2;
  if (s === 'processing' || s === 'packed_at_warehouse' || s === 'packed') return 2;
  if (s === 'confirmed') return 1;
  if (s === 'placed' || s === 'pending') return 0;
  return 1; // fallback to Confirmed
};

export default function PremiumAccount({ useShop }) {
  const { user, setUser, setRoute, wishlist, toggleWishlist, cart, addToCart } = useShop()
  const [activeTab, setActiveTab] = useState('orders') // orders | profile | addresses | payments | notifications | settings | support | wishlist
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  
  // Custom states for the redesigned Orders tab
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null)

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'confirmed';
    let classes = "";
    let label = s.toUpperCase();
    
    if (s === 'cancelled') {
      classes = "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30";
      label = "CANCELLED";
    } else if (s === 'delivered') {
      classes = "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border border-neutral-900 dark:border-neutral-850";
      label = "DELIVERED";
    } else if (s === 'shipped' || s === 'out-for-delivery' || s === 'out_for_delivery') {
      classes = "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30";
      label = s === 'shipped' ? "SHIPPED" : "OUT FOR DELIVERY";
    } else {
      classes = "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30";
      label = s === 'confirmed' ? "CONFIRMED" : "PROCESSING";
    }
    
    return (
      <span className={`text-[9px] tracking-widest font-bold px-3 py-1 uppercase rounded-full ${classes}`}>
        {label}
      </span>
    );
  };

  // Timeline Helper
  const renderTimeline = (order) => {
    const currentIdx = getOrderStatusIndex(order.status);
    const stages = [
      { key: 'placed', label: 'Order Placed', icon: Package },
      { key: 'confirmed', label: 'Confirmed', icon: Check },
      { key: 'packed', label: 'Packed', icon: Gift },
      { key: 'shipped', label: 'Shipped', icon: Truck },
      { key: 'out-for-delivery', label: 'Out for Delivery', icon: MapPin },
      { key: 'delivered', label: 'Delivered', icon: Award },
    ];

    if (order.status?.toLowerCase() === 'cancelled') {
      return (
        <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
            <X className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Order Cancelled</p>
            <p className="text-[10px] text-rose-500/80 mt-0.5">This order was cancelled and refunded to your payment method.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full py-6">
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <div className="min-w-[640px] md:min-w-0 md:w-full relative flex items-center justify-between pb-4">
            
            {/* Connecting Line Backing */}
            <div className="absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-neutral-200 dark:bg-neutral-800 z-0" />
            
            {/* Connecting Line Active Fill */}
            <div 
              className="absolute top-[18px] left-[5%] h-0.5 bg-neutral-950 dark:bg-neutral-200 transition-all duration-500 z-0" 
              style={{ 
                width: currentIdx >= 0 ? `${(Math.min(currentIdx, 5) / 5) * 90}%` : '0%' 
              }}
            />

            {stages.map((stage, i) => {
              const Icon = stage.icon;
              const isCompleted = i < currentIdx;
              const isCurrent = i === currentIdx;
              const isFuture = i > currentIdx;

              return (
                <div key={stage.key} className="flex-1 flex flex-col items-center relative z-10">
                  {/* Node Dot / Icon */}
                  <div className="relative">
                    {isCurrent && (
                      <span className="absolute -inset-1 rounded-full bg-neutral-950/10 dark:bg-white/10 animate-ping" />
                    )}
                    <div 
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border ${
                        isCompleted 
                          ? 'bg-neutral-900 border-neutral-300 text-white dark:bg-white dark:border-neutral-700 dark:text-neutral-950' 
                          : isCurrent
                            ? 'bg-neutral-950 border-neutral-950 text-white shadow-lg shadow-neutral-950/20 dark:bg-white dark:border-white dark:text-neutral-950 dark:shadow-white/10'
                            : 'bg-neutral-100 border-neutral-200 text-neutral-400 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-600'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {/* Node Label */}
                  <span 
                    className={`text-[9px] tracking-widest font-bold mt-3 whitespace-nowrap uppercase ${
                      isCompleted || isCurrent 
                        ? 'text-neutral-900 font-semibold dark:text-neutral-100' 
                        : 'text-neutral-400 dark:text-neutral-600'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Invoice Modal Helper
  const renderInvoiceModal = (order) => {
    return (
      <div className="fixed inset-0 z-[200] bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-neutral-950 w-full max-w-2xl relative shadow-2xl border border-neutral-100 dark:border-neutral-900 rounded-none p-8 md:p-10 my-8 print:shadow-none print:border-none print:p-0 print:my-0"
        >
          {/* CSS style block for absolute printing perfection */}
          <style>{`
            @media print {
              body {
                background: white !important;
                color: black !important;
              }
              .print-hidden {
                display: none !important;
              }
              .print-full-width {
                width: 100% !important;
                max-width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
              }
            }
          `}</style>

          {/* Modal Close Button */}
          <button 
            onClick={() => setSelectedInvoiceOrder(null)}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors print-hidden text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="print-full-width space-y-8">
            {/* Invoice Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-neutral-100 dark:border-neutral-900 pb-8">
              <div>
                <div className="font-display font-bold text-2xl tracking-tight text-neutral-900 dark:text-neutral-100 uppercase">
                  VELORA<span className="text-[10px] uppercase tracking-widest text-neutral-400 font-normal ml-2">Premium</span>
                </div>
                <p className="text-[9px] font-mono text-neutral-400 mt-1 uppercase tracking-widest">
                  Premium Indian & Pakistani Ethnic Fashion
                </p>
                <p className="text-[9px] text-neutral-500 mt-2 font-mono uppercase tracking-wider">
                  Bengaluru · GSTIN: 29ABCDE1234F1Z5
                </p>
              </div>
              <div className="text-left md:text-right space-y-1">
                <h3 className="text-sm font-display tracking-widest font-semibold uppercase text-neutral-900 dark:text-neutral-100">TAX INVOICE</h3>
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  INVOICE NO: INV-{order.id?.slice(-8)}
                </p>
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  DATE: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Billing Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs pb-4 border-b border-neutral-150 dark:border-neutral-900">
              <div>
                <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-2 font-semibold">CUSTOMER DETAILS</p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100 uppercase font-sans">{order.address?.name || order.name}</p>
                <p className="text-neutral-500 mt-0.5">{order.email}</p>
                <p className="text-neutral-500">{order.address?.phone || order.phone}</p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-2 font-semibold">DELIVERY ADDRESS</p>
                <div className="text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed uppercase">
                  <p>{order.address?.line1}</p>
                  {order.address?.line2 && <p>{order.address?.line2}</p>}
                  <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-900 text-neutral-400 uppercase tracking-widest text-[9px] font-semibold">
                    <th className="py-3">Apparel Item</th>
                    <th className="py-3 text-center">Qty</th>
                    <th className="py-3 text-right">Unit Price</th>
                    <th className="py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="text-neutral-700 dark:text-neutral-300">
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 uppercase">{item.name}</p>
                        <p className="text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5">
                          Size: {item.size} · Color: {item.color}
                        </p>
                      </td>
                      <td className="py-4 text-center font-mono">{item.qty}</td>
                      <td className="py-4 text-right font-mono">{fmt(item.price)}</td>
                      <td className="py-4 text-right font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                        {fmt(item.price * item.qty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-neutral-100 dark:border-neutral-900 pt-6 flex flex-col items-end">
              <div className="w-full md:w-80 space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400 font-sans">
                <div className="flex justify-between">
                  <span className="uppercase tracking-wider">Subtotal</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">{fmt(order.subtotal || order.total)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="uppercase tracking-wider">Discount</span>
                    <span className="font-semibold font-mono">-{fmt(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="uppercase tracking-wider">CGST (9%)</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                    {fmt(Math.round(((order.subtotal || order.total) - (order.discount || 0)) * 0.09))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="uppercase tracking-wider">SGST (9%)</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                    {fmt(Math.round(((order.subtotal || order.total) - (order.discount || 0)) * 0.09))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="uppercase tracking-wider">Shipping</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                    {order.shipping > 0 ? fmt(order.shipping) : 'FREE'}
                  </span>
                </div>
                <div className="h-px bg-neutral-150 dark:bg-neutral-900 my-2" />
                <div className="flex justify-between text-sm text-neutral-900 dark:text-neutral-100 font-bold">
                  <span className="uppercase tracking-widest font-display">Grand Total</span>
                  <span className="font-mono">{fmt(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Invoice Footer note */}
            <div className="text-center text-[9px] font-mono text-neutral-400 uppercase tracking-widest border-t border-neutral-100 dark:border-neutral-900 pt-8 mt-8">
              <p>Thank you for choosing VELORA.</p>
              <p className="mt-1">This is an electronically generated document. No signature required.</p>
            </div>

            {/* Action Buttons for printed invoice */}
            <div className="flex gap-3 pt-6 print-hidden">
              <Button
                onClick={() => window.print()}
                className="flex-1 rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-[10px] tracking-[0.2em] font-semibold h-11 uppercase flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </Button>
              <Button
                onClick={() => setSelectedInvoiceOrder(null)}
                variant="outline"
                className="flex-1 rounded-none border-neutral-200 hover:border-neutral-950 text-[10px] tracking-[0.2em] font-semibold h-11 uppercase"
              >
                Close Receipt
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // Gift Icon local fallback
  const Gift = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s-2-5-4.5-5a2.5 2.5 0 0 1 0 5z" />
      <path d="M16.5 8a2.5 2.5 0 0 0 0-5C14 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 0 0 5z" />
    </svg>
  );

  // Memoized filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // 1. Filter by status
      const status = o.status?.toLowerCase() || 'confirmed';
      if (orderStatusFilter === 'processing') {
        if (status === 'cancelled' || status === 'delivered' || status === 'shipped') return false;
      } else if (orderStatusFilter === 'shipped') {
        if (status !== 'shipped' && status !== 'out-for-delivery') return false;
      } else if (orderStatusFilter === 'delivered') {
        if (status !== 'delivered') return false;
      } else if (orderStatusFilter === 'cancelled') {
        if (status !== 'cancelled') return false;
      }

      // 2. Filter by search query (Order ID or Product Name)
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const matchId = o.id?.toLowerCase().includes(q);
        const matchProduct = o.items?.some(item => item.name?.toLowerCase().includes(q));
        return matchId || matchProduct;
      }

      return true;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  
  // Addresses State
  const [addresses, setAddresses] = useState([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    id: '', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false
  })

  // Payments State
  const [payments, setPayments] = useState([])
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    id: '', holder: '', number: '', exp: '', cvv: '', brand: 'visa'
  })

  // Support Tickets State
  const [tickets, setTickets] = useState([])
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'sizing', message: '' })

  // Notifications preferences
  const [notifPrefs, setNotifPrefs] = useState({
    orderUpdates: true, priceDrops: false, newDrops: true, whatsappAlerts: true
  })

  // General Settings preferences
  const [settingsPrefs, setSettingsPrefs] = useState({
    region: 'India', currency: 'INR', stylingAdvice: true
  })

  // Password fields for profile update
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    currentPassword: '',
    newPassword: '',
    showPass: false
  })

  // System alert feeds
  const [alerts, setAlerts] = useState([
    { id: 1, title: 'Secure Sign In Detected', desc: 'A secure login was completed from your device.', date: 'Just now', read: false },
    { id: 2, title: '100 Welcome Points Credited', desc: 'Starting reward points successfully registered to your Couture wallet.', date: '1 hour ago', read: false },
    { id: 3, title: 'New Nebula Stock Arrived', desc: 'The Nebula Oversized Hoodie in Void Black is now fully restocked in our Bengaluru atelier.', date: 'Yesterday', read: true }
  ])

  // Fetch orders and other saved items
  useEffect(() => {
    if (user?.email) {
      setLoadingOrders(true)
      fetch(`/api/orders?email=${user.email}`)
        .then(r => r.json())
        .then(d => {
          setOrders(d.orders || [])
          setLoadingOrders(false)
        })
        .catch(err => {
          console.error("Failed to load orders:", err)
          setLoadingOrders(false)
        })

      // Load user preferences/addresses/payments from cache or API
      try {
        const savedAddresses = JSON.parse(localStorage.getItem(`velora_addresses_${user.email}`) || '[]')
        setAddresses(savedAddresses.length > 0 ? savedAddresses : [
          { id: 'addr_1', name: user.name, phone: '+91 98765 43210', line1: 'No. 42, 80 Feet Road, Indiranagar', line2: 'Opposite Metro Station', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', isDefault: true }
        ])

        const savedPayments = JSON.parse(localStorage.getItem(`velora_payments_${user.email}`) || '[]')
        setPayments(savedPayments.length > 0 ? savedPayments : [
          { id: 'pay_1', holder: user.name, number: '•••• •••• •••• 4242', exp: '12/28', brand: 'visa' }
        ])

        const savedTickets = JSON.parse(localStorage.getItem(`velora_tickets_${user.email}`) || '[]')
        setTickets(savedTickets.length > 0 ? savedTickets : [
          { id: 'TKT-9024', subject: 'Inquiry regarding Nebula sizing', category: 'sizing', date: '2 days ago', status: 'Resolved', message: 'Hi there, I wanted to know if Nebula hoodie runs too oversized?' }
        ])
      } catch (e) {
        console.warn(e)
      }
    }
  }, [user])

  // Force redirect if user signed out
  useEffect(() => {
    if (!user) {
      setRoute({ view: 'auth' })
    }
  }, [user])

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
    } catch (e) {
      console.warn("Logout endpoint error:", e)
    }
    localStorage.removeItem('velora_user')
    setUser(null)
    setRoute({ view: 'home' })
    toast.success('Successfully logged out')
  }

  const handleLogoutAllDevices = async () => {
    try {
      const response = await fetch('/api/logout-all-devices', {
        method: 'POST'
      }).then(r => r.json())

      if (response.error) {
        toast.error(response.error)
        return
      }

      toast.success("Successfully terminated all active sessions globally.")
      localStorage.removeItem('velora_user')
      setUser(null)
      setRoute({ view: 'home' })
    } catch (err) {
      toast.error("Failed to terminate other sessions. Please try again.")
    }
  }

  // Profile Save
  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!profileForm.name) return toast.error('Name cannot be empty')
    
    // Simulate updating user API
    const updatedUser = {
      ...user,
      name: profileForm.name,
      phone: profileForm.phone,
      dob: profileForm.dob
    }

    try {
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: profileForm.name,
          phone: profileForm.phone,
          dob: profileForm.dob,
          newPassword: profileForm.newPassword || undefined
        })
      }).then(r => r.json())

      if (response.error) {
        return toast.error(response.error)
      }

      setUser(updatedUser)
      localStorage.setItem('velora_user', JSON.stringify(updatedUser))
      toast.success('Your profile has been updated')
      setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }))
    } catch (err) {
      // Fallback
      setUser(updatedUser)
      localStorage.setItem('velora_user', JSON.stringify(updatedUser))
      toast.success('Profile updated (Local session sync completed)')
    }
  }

  // Address CRUD
  const saveAddress = (e) => {
    e.preventDefault()
    if (!addressForm.name || !addressForm.phone || !addressForm.line1 || !addressForm.city || !addressForm.pincode) {
      return toast.error('Please fill in all mandatory address fields')
    }

    let updated = []
    if (addressForm.id) {
      // Edit
      updated = addresses.map(a => a.id === addressForm.id ? { ...addressForm } : a)
    } else {
      // Create
      const newAddr = { ...addressForm, id: 'addr_' + Date.now() }
      updated = [...addresses, newAddr]
    }

    // Handle default address setting
    if (addressForm.isDefault) {
      updated = updated.map(a => a.id === addressForm.id || (addressForm.id === '' && a.id === updated[updated.length - 1].id) ? { ...a, isDefault: true } : { ...a, isDefault: false })
    }

    setAddresses(updated)
    localStorage.setItem(`velora_addresses_${user.email}`, JSON.stringify(updated))
    setShowAddressForm(false)
    setAddressForm({ id: '', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false })
    toast.success(addressForm.id ? 'Address updated' : 'New address added')
  }

  const deleteAddress = (id) => {
    const updated = addresses.filter(a => a.id !== id)
    setAddresses(updated)
    localStorage.setItem(`velora_addresses_${user.email}`, JSON.stringify(updated))
    toast.success('Address removed')
  }

  // Payment CRUD
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    // Detect brand
    let brand = 'visa'
    if (value.startsWith('4')) brand = 'visa'
    else if (value.startsWith('5')) brand = 'mastercard'
    else if (value.startsWith('3')) brand = 'amex'
    else brand = 'visa'

    // Format with spaces
    let formatted = ''
    for (let i = 0; i < value.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' '
      formatted += value[i]
    }

    setPaymentForm({ ...paymentForm, number: formatted, brand })
  }

  const handleExpChange = (e) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 2) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4)
    }
    setPaymentForm({ ...paymentForm, exp: val.slice(0, 5) })
  }

  const savePayment = (e) => {
    e.preventDefault()
    if (!paymentForm.holder || !paymentForm.number || !paymentForm.exp || !paymentForm.cvv) {
      return toast.error('Please enter complete credit card credentials')
    }

    const maskedNumber = '•••• •••• •••• ' + paymentForm.number.slice(-4)
    const newPay = {
      id: 'pay_' + Date.now(),
      holder: paymentForm.holder,
      number: maskedNumber,
      exp: paymentForm.exp,
      brand: paymentForm.brand
    }

    const updated = [...payments, newPay]
    setPayments(updated)
    localStorage.setItem(`velora_payments_${user.email}`, JSON.stringify(updated))
    setShowPaymentForm(false)
    setPaymentForm({ id: '', holder: '', number: '', exp: '', cvv: '', brand: 'visa' })
    toast.success('Card saved successfully')
  }

  const deletePayment = (id) => {
    const updated = payments.filter(p => p.id !== id)
    setPayments(updated)
    localStorage.setItem(`velora_payments_${user.email}`, JSON.stringify(updated))
    toast.success('Card removed')
  }

  // Support Submission
  const submitTicket = (e) => {
    e.preventDefault()
    if (!ticketForm.subject || !ticketForm.message) {
      return toast.error('Please input subject and detailed message')
    }

    const newTkt = {
      id: 'TKT-' + Math.floor(1000 + Math.random() * 9000),
      subject: ticketForm.subject,
      category: ticketForm.category,
      message: ticketForm.message,
      date: 'Just now',
      status: 'Awaiting Review'
    }

    const updated = [newTkt, ...tickets]
    setTickets(updated)
    localStorage.setItem(`velora_tickets_${user.email}`, JSON.stringify(updated))
    setTicketForm({ subject: '', category: 'sizing', message: '' })
    toast.success('Support ticket created. Our team will respond within 4 hours.')
  }

  // Clear all alerts
  const markAllAlertsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })))
    toast.success('Clear signals completed')
  }

  return (
    <div className="pt-8 pb-24 px-4 md:px-12 max-w-[1500px] mx-auto select-none bg-[#fafaf9]">
      
      {/* Visual Identity Title */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-100 pb-8 gap-4">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-neutral-400 font-bold uppercase mb-2">YOUR ACCOUNT</p>
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-neutral-900">
            WELCOME BACK, {user?.name?.toUpperCase()}
          </h1>
          <p className="text-xs text-neutral-500 mt-2 font-mono tracking-wider">
            ACCOUNT STATUS: ACTIVE · MEMBER SINCE {new Date(user?.createdAt || Date.now()).getFullYear()}
          </p>
        </div>

        {/* Couture privileges display */}
        <div className="flex gap-4">
          <div className="bg-white border border-neutral-100 px-5 py-3.5 flex flex-col justify-between min-w-[140px] shadow-sm">
            <span className="text-[9px] tracking-widest text-neutral-400 font-bold uppercase">REWARD POINTS</span>
            <span className="text-xl font-display font-semibold mt-1 flex items-center gap-1.5 text-neutral-950">
              <Award className="w-4 h-4 text-neutral-400" /> {user?.rewards || 100}
            </span>
          </div>
          <div className="bg-white border border-neutral-100 px-5 py-3.5 flex flex-col justify-between min-w-[140px] shadow-sm">
            <span className="text-[9px] tracking-widest text-neutral-400 font-bold uppercase">WALLET CREDIT</span>
            <span className="text-xl font-display font-semibold mt-1 text-neutral-950">
              {fmt(user?.wallet || 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar navigation */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white border border-neutral-100 p-6 space-y-1 shadow-sm">
            {[
              { id: 'orders', label: 'ORDER HISTORY', icon: Package },
              { id: 'wishlist', label: 'MY WISHLIST', icon: Heart },
              { id: 'profile', label: 'PROFILE DETAILS', icon: User },
              { id: 'addresses', label: 'SAVED ADDRESSES', icon: MapPin },
              { id: 'payments', label: 'SAVED CARDS', icon: CreditCard },
              { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell },
              { id: 'support', label: 'CUSTOMER SUPPORT', icon: HelpCircle },
              { id: 'settings', label: 'SETTINGS', icon: Sliders },
            ].map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-[11px] tracking-[0.15em] font-medium transition-all duration-300 rounded-none text-left ${
                    active 
                      ? 'bg-neutral-950 text-white font-semibold' 
                      : 'text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50/50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-neutral-400'}`} />
                    {tab.label}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${active ? 'text-white translate-x-1' : 'text-neutral-300'}`} />
                </button>
              )
            })}
            
            <div className="h-px bg-neutral-100 my-4" />
            
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-[11px] tracking-[0.15em] font-medium text-neutral-400 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              LOG OUT
            </button>
          </div>
        </aside>

        {/* Tab contents panel */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-neutral-100 p-8 shadow-sm min-h-[520px]"
            >
              
              {/* ORDERS PANEL */}
              {activeTab === 'orders' && (
                <div className="space-y-8">
                  {/* Hero Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-neutral-100 dark:border-neutral-800 pb-6"
                  >
                    <h2 className="text-3xl font-display font-medium tracking-tight text-neutral-950 dark:text-white silver-text uppercase">My Orders</h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 font-sans">
                      Track every couture order with real-time updates.
                    </p>
                  </motion.div>

                  {/* Controls: Search & Filters */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 pb-1">
                    {/* Filters */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 md:mx-0 md:px-0">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'processing', label: 'Processing' },
                        { id: 'shipped', label: 'Shipped' },
                        { id: 'delivered', label: 'Delivered' },
                        { id: 'cancelled', label: 'Cancelled' }
                      ].map((filter) => {
                        const active = orderStatusFilter === filter.id;
                        return (
                          <button
                            key={filter.id}
                            onClick={() => setOrderStatusFilter(filter.id)}
                            className={`relative px-4 py-2 text-[10px] tracking-widest uppercase font-semibold transition-all duration-300 rounded-full ${
                              active 
                                ? 'text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-800' 
                                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-300'
                            }`}
                          >
                            <span className="relative z-10">{filter.label}</span>
                            {active && (
                              <motion.span 
                                layoutId="activeFilterUnderline"
                                className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 rounded-full z-0"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Search by ID or Product..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-9 bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 text-[10px] tracking-wider outline-none focus:border-neutral-950 dark:focus:border-neutral-200 transition-all rounded-full font-medium"
                      />
                      {orderSearchQuery && (
                        <button 
                          onClick={() => setOrderSearchQuery('')}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {loadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-24">
                      <div className="w-6 h-6 border-2 border-neutral-950 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] tracking-[0.25em] text-neutral-400 dark:text-neutral-500 uppercase mt-4 font-mono">Syncing couture archives...</p>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="border border-neutral-100 dark:border-neutral-800/80 rounded-2xl bg-white dark:bg-neutral-900/20 py-16">
                      <div className="text-center py-8 px-4 max-w-sm mx-auto space-y-6">
                        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                          <svg className="w-full h-full text-neutral-200 dark:text-neutral-800" fill="none" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                            <path d="M50 30 C53 30, 55 33, 53 36 C51 38, 48 39, 48 41 L48 45" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            <path d="M32 54 L50 44 L68 54 Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M42 49 L36 72 L64 72 L58 49 Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="absolute w-2 h-2 rounded-full bg-neutral-950 dark:bg-white animate-pulse top-3 right-3" />
                        </div>
                        
                        <div className="space-y-1.5">
                          <h3 className="text-xs font-display tracking-widest text-neutral-900 dark:text-white uppercase font-bold">No Orders Found</h3>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                            {orderSearchQuery || orderStatusFilter !== 'all' 
                              ? "We couldn't find any orders matching your criteria."
                              : "You haven't placed your first couture order yet."}
                          </p>
                        </div>
                        
                        <Button
                          onClick={() => setRoute({ view: 'shop' })}
                          className="w-full rounded-full bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-[9px] tracking-[0.2em] font-bold uppercase h-10 transition-all duration-300"
                        >
                          Explore Collection
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {filteredOrders.map(o => {
                        const currentIdx = getOrderStatusIndex(o.status);
                        const isCancelled = o.status?.toLowerCase() === 'cancelled';
                        const estimatedDeliveryDate = o.estimatedDelivery 
                          ? new Date(o.estimatedDelivery) 
                          : new Date(new Date(o.createdAt).getTime() + 5 * 24 * 3600 * 1000);

                        return (
                          <div 
                            key={o.id} 
                            className="bg-white dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-800/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm hover:shadow-md transition-all duration-500"
                          >
                            {/* Card Header Info */}
                            <div className="flex flex-col md:flex-row md:items-start justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800/60 gap-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 flex-1">
                                <div>
                                  <span className="text-[8px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-1">Order Reference</span>
                                  <p className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">{o.id}</p>
                                </div>
                                <div>
                                  <span className="text-[8px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-1">Request Date</span>
                                  <p className="text-xs text-neutral-700 dark:text-neutral-300">
                                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                  <span className="text-[8px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-1">Estimated Arrival</span>
                                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                    {isCancelled 
                                      ? "TERMINATED" 
                                      : estimatedDeliveryDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center md:justify-end gap-2">
                                {renderStatusBadge(o.status)}
                              </div>
                            </div>

                            {/* Order items listing */}
                            <div className="space-y-4">
                              {o.items?.map((item, idx) => (
                                <div key={idx} className="flex items-start md:items-center gap-5 text-xs">
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-14 h-16 object-cover border border-neutral-100 dark:border-neutral-800 rounded-lg bg-neutral-50" 
                                  />
                                  <div className="flex-1 min-w-0 py-1">
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate text-sm uppercase">{item.name}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-wider">
                                      <span>Size: <strong className="text-neutral-800 dark:text-neutral-200">{item.size}</strong></span>
                                      <span>Color: <strong className="text-neutral-800 dark:text-neutral-200">{item.color}</strong></span>
                                      <span>Qty: <strong className="text-neutral-800 dark:text-neutral-200">{item.qty}</strong></span>
                                    </div>
                                  </div>
                                  <span className="font-bold text-neutral-950 dark:text-white font-mono text-sm py-1">
                                    {fmt(item.price * item.qty)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="h-px bg-neutral-100 dark:bg-neutral-800/60" />

                            {/* Billing & Address dossier */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-neutral-600 dark:text-neutral-400 pt-1">
                              <div>
                                <span className="text-[8px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2 font-semibold">Dispatch Destination</span>
                                <div className="space-y-1 uppercase tracking-wide">
                                  <p className="font-bold text-neutral-900 dark:text-neutral-100">{o.address?.name || o.name}</p>
                                  <p className="text-neutral-500 dark:text-neutral-400">{o.address?.line1}</p>
                                  {o.address?.line2 && <p className="text-neutral-500 dark:text-neutral-400">{o.address?.line2}</p>}
                                  <p className="text-neutral-500 dark:text-neutral-400">{o.address?.city}, {o.address?.state} - {o.address?.pincode}</p>
                                  <p className="text-[10px] font-mono text-neutral-400 mt-1">{o.address?.phone || o.phone}</p>
                                </div>
                              </div>
                              <div className="md:border-l md:border-neutral-100 md:dark:border-neutral-800 md:pl-6 space-y-3">
                                <span className="text-[8px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-1 font-semibold">Dossier Summary</span>
                                <div className="space-y-2 text-neutral-500 dark:text-neutral-400">
                                  <div className="flex justify-between">
                                    <span>Method</span>
                                    <span className="font-medium text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Razorpay Secure</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-mono text-neutral-800 dark:text-neutral-200">{fmt(o.subtotal || o.total)}</span>
                                  </div>
                                  {o.discount > 0 && (
                                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                                      <span>Privilege Discount</span>
                                      <span className="font-mono">-{fmt(o.discount)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-neutral-800 dark:text-neutral-200 font-bold text-sm pt-2 border-t border-neutral-100 dark:border-neutral-850">
                                    <span className="uppercase tracking-widest font-display">Grand Total</span>
                                    <span className="font-mono">{fmt(o.total)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="h-px bg-neutral-100 dark:bg-neutral-800/60" />

                            {/* Status Timeline */}
                            {renderTimeline(o)}

                            {/* Actions Footer */}
                            <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 pt-2">
                              {!isCancelled && (
                                <Button 
                                  onClick={() => setRoute({ view: 'track-order', orderId: o.id })}
                                  className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-[9px] tracking-[0.2em] font-semibold h-10 px-6 uppercase shadow-sm flex items-center justify-center gap-2"
                                >
                                  <Truck className="w-3.5 h-3.5" /> Track Order
                                </Button>
                              )}
                              <Button 
                                onClick={() => setSelectedInvoiceOrder(o)}
                                variant="outline"
                                className="rounded-full border-neutral-200 hover:border-neutral-950 text-[9px] tracking-[0.2em] font-semibold h-10 px-6 uppercase flex items-center justify-center gap-2"
                              >
                                <Download className="w-3.5 h-3.5" /> Invoice Receipt
                              </Button>
                              <Button 
                                onClick={() => setActiveTab('support')}
                                variant="ghost"
                                className="rounded-full text-neutral-400 hover:text-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-[9px] tracking-[0.2em] font-semibold h-10 px-4 uppercase"
                              >
                                Need Help
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Invoice Modal Render */}
                  <AnimatePresence>
                    {selectedInvoiceOrder && renderInvoiceModal(selectedInvoiceOrder)}
                  </AnimatePresence>
                </div>
              )}

              {/* CURATED WISHLIST */}
              {activeTab === 'wishlist' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-display tracking-wide uppercase text-neutral-950">CURATED LOOKS</h2>
                    <span className="text-[10px] text-neutral-400 font-mono">LIKED ITEMS: {wishlist.length}</span>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                      <Heart className="w-12 h-12 text-neutral-200 mx-auto" />
                      <div>
                        <h3 className="text-sm font-medium uppercase tracking-wider text-neutral-900">Wishlist empty</h3>
                        <p className="text-xs text-neutral-400 mt-1">Curation represents your visual style boards.</p>
                      </div>
                      <Button
                        onClick={() => setRoute({ view: 'shop' })}
                        className="rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-widest font-semibold px-6 h-10"
                      >
                        BROWSE STYLES
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wishlist.map(id => {
                        // Normally we would find the product in context
                        return (
                          <div key={id} className="border border-neutral-100 p-4 flex gap-4 relative group">
                            <button 
                              onClick={() => toggleWishlist(id)}
                              className="absolute top-3 right-3 text-neutral-300 hover:text-neutral-950 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <div className="w-20 h-24 bg-neutral-50 border border-neutral-100 flex-shrink-0 relative">
                              {/* Soft placeholder while listing */}
                              <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center text-[10px] text-neutral-400 uppercase font-mono font-bold">VELORA</div>
                            </div>

                            <div className="flex-1 flex flex-col justify-between py-1">
                              <div>
                                <span className="text-[8px] tracking-widest font-bold text-neutral-400 uppercase">ITEM ID: {id}</span>
                                <h4 className="text-xs font-semibold text-neutral-900 uppercase mt-0.5 mt-1">Premium Couture Look</h4>
                                <p className="text-xs font-semibold text-neutral-900 font-mono mt-1">₹2,499 - ₹5,499</p>
                              </div>
                              <Button
                                onClick={() => setRoute({ view: 'shop' })}
                                className="w-full md:w-auto self-start mt-2 h-8 rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-[10px] tracking-widest uppercase font-semibold px-4"
                              >
                                VIEW STYLING
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* IDENTITY PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-display tracking-wide uppercase text-neutral-950">CLIENT INFRASTRUCTURE</h2>
                    <p className="text-xs text-neutral-400 mt-1">Update your general identity information or credentials safely.</p>
                  </div>

                  <form onSubmit={handleProfileSave} className="space-y-5 max-w-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-widest font-semibold text-neutral-400 uppercase font-mono">FULL NAME</label>
                        <input 
                          type="text"
                          value={profileForm.name}
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full h-11 px-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-150 focus:border-neutral-900 outline-none transition rounded-none uppercase font-sans font-medium text-neutral-850"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-widest font-semibold text-neutral-400 uppercase font-mono">EMAIL ADDRESS</label>
                        <input 
                          disabled
                          type="email"
                          value={profileForm.email}
                          className="w-full h-11 px-4 bg-neutral-100 text-neutral-400 text-xs tracking-wider border border-neutral-150 outline-none rounded-none uppercase font-sans font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-widest font-semibold text-neutral-400 uppercase font-mono">MOBILE NUMBER</label>
                        <input 
                          type="text"
                          placeholder="+91 XXXXX XXXXX"
                          value={profileForm.phone}
                          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full h-11 px-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-150 focus:border-neutral-900 outline-none transition rounded-none uppercase font-sans font-medium text-neutral-850"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] tracking-widest font-semibold text-neutral-400 uppercase font-mono">DATE OF BIRTH</label>
                        <input 
                          type="date"
                          value={profileForm.dob}
                          onChange={e => setProfileForm({ ...profileForm, dob: e.target.value })}
                          className="w-full h-11 px-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-150 focus:border-neutral-900 outline-none transition rounded-none font-sans font-medium text-neutral-850"
                        />
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100 my-6" />

                    <div className="space-y-4">
                      <h3 className="text-xs tracking-wider uppercase font-semibold text-neutral-900">CHANGE CLIENT SECURITY KEY (PASSWORD)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] tracking-widest font-semibold text-neutral-400 uppercase font-mono font-bold">CURRENT PASSWORD</label>
                          <input 
                            type="password"
                            placeholder="CURRENT SECURITY PASSWORD"
                            value={profileForm.currentPassword}
                            onChange={e => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                            className="w-full h-11 px-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-150 focus:border-neutral-900 outline-none transition rounded-none uppercase font-sans font-medium text-neutral-850"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] tracking-widest font-semibold text-neutral-400 uppercase font-mono font-bold">NEW PASSWORD</label>
                          <input 
                            type="password"
                            placeholder="CHOOSE NEW SECURITY PASSWORD"
                            value={profileForm.newPassword}
                            onChange={e => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                            className="w-full h-11 px-4 bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-150 focus:border-neutral-900 outline-none transition rounded-none uppercase font-sans font-medium text-neutral-850"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100 my-6" />

                    <div className="space-y-4">
                      <h3 className="text-xs tracking-wider uppercase font-semibold text-neutral-900">DEVICE SECURITY CONSOLE</h3>
                      <p className="text-xs text-neutral-500 max-w-xl">
                        Terminate all active sessions globally on other devices if you logged in from a public computer or suspect unauthorized access.
                      </p>
                      <Button
                        type="button"
                        onClick={handleLogoutAllDevices}
                        className="rounded-none border border-neutral-300 bg-transparent text-neutral-950 hover:bg-neutral-50 hover:border-neutral-900 text-xs tracking-[0.2em] uppercase font-semibold h-11 px-6 transition-all"
                      >
                        LOGOUT FROM ALL DEVICES
                      </Button>
                    </div>

                    <div className="h-px bg-neutral-100 my-6" />

                    <Button
                      type="submit"
                      className="rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-[0.2em] uppercase font-semibold h-11 px-6 mt-4"
                    >
                      SAVE PROFILE INFORMATION
                    </Button>
                  </form>
                </div>
              )}

              {/* ADDRESS BOOK */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-display tracking-wide uppercase text-neutral-950">PORTFOLIO ADDRESSES</h2>
                    {!showAddressForm && (
                      <Button
                        onClick={() => {
                          setAddressForm({ id: '', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false })
                          setShowAddressForm(true)
                        }}
                        className="rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-widest uppercase font-semibold px-4 h-9 flex items-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" /> ADD ADDRESS
                      </Button>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {showAddressForm ? (
                      <motion.form
                        key="addr-form"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        onSubmit={saveAddress}
                        className="space-y-4 max-w-xl border border-neutral-100 p-6"
                      >
                        <h3 className="text-xs tracking-wider uppercase font-semibold text-neutral-950">
                          {addressForm.id ? 'EDIT ADDRESS IDENTIFIER' : 'REGISTER NEW DESTINATION'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">RECIPIENT NAME</label>
                            <input
                              required
                              type="text"
                              value={addressForm.name}
                              onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">MOBILE NUMBER</label>
                            <input
                              required
                              type="text"
                              value={addressForm.phone}
                              onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">STREET ADDRESS (LINE 1)</label>
                          <input
                            required
                            type="text"
                            value={addressForm.line1}
                            onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })}
                            className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">LOCALITY/APARTMENT (LINE 2)</label>
                          <input
                            type="text"
                            value={addressForm.line2}
                            onChange={e => setAddressForm({ ...addressForm, line2: e.target.value })}
                            className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">CITY</label>
                            <input
                              required
                              type="text"
                              value={addressForm.city}
                              onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">STATE</label>
                            <input
                              required
                              type="text"
                              value={addressForm.state}
                              onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">PINCODE</label>
                            <input
                              required
                              type="text"
                              maxLength="6"
                              value={addressForm.pincode}
                              onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs select-none">
                          <input
                            type="checkbox"
                            id="default-address"
                            checked={addressForm.isDefault}
                            onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="accent-neutral-900"
                          />
                          <label htmlFor="default-address" className="text-neutral-500 cursor-pointer">Set as default dispatch address</label>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <Button
                            type="submit"
                            className="rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-[11px] tracking-widest uppercase font-semibold h-10 px-5 flex-1"
                          >
                            SAVE DESTINATION
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            variant="outline"
                            className="rounded-none border-neutral-200 text-[11px] tracking-widest uppercase h-10 px-5"
                          >
                            CANCEL
                          </Button>
                        </div>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="addr-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {addresses.map(a => (
                          <div key={a.id} className={`border p-6 flex flex-col justify-between transition relative ${a.isDefault ? 'border-neutral-900 shadow-sm' : 'border-neutral-100'}`}>
                            {a.isDefault && (
                              <span className="absolute top-4 right-4 bg-neutral-950 text-white font-mono text-[8px] font-bold tracking-widest px-2.5 py-1 uppercase rounded-none select-none">
                                DEFAULT
                              </span>
                            )}
                            
                            <div>
                              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">RECIPIENT PORT</p>
                              <p className="text-xs font-semibold uppercase text-neutral-950 mt-1 font-sans">{a.name}</p>
                              <p className="text-xs text-neutral-500 mt-0.5">{a.phone}</p>
                              <div className="mt-4 text-xs font-sans text-neutral-700 leading-relaxed uppercase">
                                <p>{a.line1}</p>
                                {a.line2 && <p>{a.line2}</p>}
                                <p>{a.city}, {a.state} - {a.pincode}</p>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-6 pt-4 border-t border-neutral-50">
                              <button
                                onClick={() => {
                                  setAddressForm({ ...a })
                                  setShowAddressForm(true)
                                }}
                                className="text-[10px] tracking-wider uppercase font-semibold text-neutral-500 hover:text-neutral-950 flex items-center gap-1"
                              >
                                <Edit className="w-3.5 h-3.5" /> EDIT
                              </button>
                              <button
                                onClick={() => deleteAddress(a.id)}
                                className="text-[10px] tracking-wider uppercase font-semibold text-neutral-400 hover:text-red-600 flex items-center gap-1 ml-auto"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> REMOVE
                              </button>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* SAVED CARDS (PAYMENT METHODS) */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-display tracking-wide uppercase text-neutral-950">BILLING CREDENTIALS</h2>
                    {!showPaymentForm && (
                      <Button
                        onClick={() => {
                          setPaymentForm({ id: '', holder: '', number: '', exp: '', cvv: '', brand: 'visa' })
                          setShowPaymentForm(true)
                        }}
                        className="rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-widest uppercase font-semibold px-4 h-9 flex items-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" /> ADD CARD
                      </Button>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {showPaymentForm ? (
                      <motion.form
                        key="pay-form"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        onSubmit={savePayment}
                        className="space-y-4 max-w-xl border border-neutral-100 p-6"
                      >
                        <h3 className="text-xs tracking-wider uppercase font-semibold text-neutral-950">
                          REGISTER SECURE CREDIT DEBIT INSTRUMENT
                        </h3>

                        <div className="space-y-1">
                          <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">CARDHOLDER NAME</label>
                          <input
                            required
                            type="text"
                            placeholder="CARDHOLDER FULL NAME"
                            value={paymentForm.holder}
                            onChange={e => setPaymentForm({ ...paymentForm, holder: e.target.value.toUpperCase() })}
                            className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1 md:col-span-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">CARD NUMBER</label>
                            <input
                              required
                              type="text"
                              placeholder="•••• •••• •••• ••••"
                              value={paymentForm.number}
                              onChange={handleCardNumberChange}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">EXPIRATION (MM/YY)</label>
                            <input
                              required
                              type="text"
                              placeholder="MM/YY"
                              maxLength="5"
                              value={paymentForm.exp}
                              onChange={handleExpChange}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">SECURITY CVV</label>
                            <input
                              required
                              type="password"
                              maxLength="4"
                              placeholder="•••"
                              value={paymentForm.cvv}
                              onChange={e => setPaymentForm({ ...paymentForm, cvv: e.target.value.replace(/\D/g, '') })}
                              className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <Button
                            type="submit"
                            className="rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-[11px] tracking-widest uppercase font-semibold h-10 px-5 flex-1"
                          >
                            REGISTER INSTRUMENT
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowPaymentForm(false)}
                            variant="outline"
                            className="rounded-none border-neutral-200 text-[11px] tracking-widest uppercase h-10 px-5"
                          >
                            CANCEL
                          </Button>
                        </div>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="pay-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {payments.map(p => (
                          <div 
                            key={p.id} 
                            className="h-44 p-6 flex flex-col justify-between border border-neutral-100 select-none relative overflow-hidden"
                            style={{
                              background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)'
                            }}
                          >
                            {/* Subtle glossy card overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-transparent to-white/[0.03] pointer-events-none" />
                            
                            <div className="flex justify-between items-start z-10">
                              <div className="text-[10px] tracking-widest font-mono text-neutral-400 uppercase font-bold">VELORA STYLIST CARD</div>
                              <span className="text-white font-mono font-bold tracking-wider text-xs uppercase">{p.brand}</span>
                            </div>

                            <div className="z-10 mt-2">
                              <span className="text-[8px] font-mono text-neutral-400 tracking-widest uppercase">SECURE CODE NUMBER</span>
                              <p className="text-sm font-mono tracking-widest text-white mt-1">{p.number}</p>
                            </div>

                            <div className="flex justify-between items-end z-10 border-t border-white/5 pt-3">
                              <div>
                                <span className="text-[7px] font-mono text-neutral-500 tracking-widest uppercase">CARDHOLDER</span>
                                <p className="text-[10px] font-sans font-medium tracking-wide text-neutral-200 uppercase truncate max-w-[120px]">{p.holder}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[7px] font-mono text-neutral-500 tracking-widest uppercase">VALID THRU</span>
                                <p className="text-[10px] font-mono text-neutral-200 mt-0.5">{p.exp}</p>
                              </div>
                              <button
                                onClick={() => deletePayment(p.id)}
                                className="text-neutral-500 hover:text-red-400 transition ml-4"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* SIGNALS & ALERTS */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-display tracking-wide uppercase text-neutral-950">SECURITY SIGNALS FEED</h2>
                    <button 
                      onClick={markAllAlertsRead}
                      className="text-[10px] font-mono font-semibold text-neutral-400 hover:text-neutral-950 uppercase tracking-widest"
                    >
                      CLEAR SIGNALS
                    </button>
                  </div>

                  <div className="space-y-3">
                    {alerts.map(a => (
                      <div key={a.id} className={`p-5 border flex items-start gap-4 transition-all duration-300 ${a.read ? 'border-neutral-50 bg-neutral-50/20' : 'border-neutral-150 bg-white shadow-sm'}`}>
                        <div className="mt-0.5 relative">
                          <Shield className={`w-5 h-5 ${a.read ? 'text-neutral-350' : 'text-neutral-950'}`} />
                          {!a.read && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-xs uppercase tracking-wide font-semibold ${a.read ? 'text-neutral-500' : 'text-neutral-905'}`}>{a.title}</h4>
                            <span className="text-[9px] font-mono text-neutral-400 uppercase shrink-0">{a.date}</span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-1 leading-relaxed uppercase">{a.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-neutral-100 my-6" />

                  <div className="space-y-4">
                    <h3 className="text-xs tracking-wider uppercase font-semibold text-neutral-950">COUTURE SIGNAL PREFERENCES</h3>
                    <div className="space-y-3 max-w-xl">
                      {[
                        { key: 'orderUpdates', title: 'DISPATCH PROGRESS UPDATES', desc: 'Alert me instantly via email when my order is processed or shipped.' },
                        { key: 'newDrops', title: 'SECRET COLLECTION DROPS', desc: 'Grant me early access notifications regarding high-tier drops and limited stock alerts.' },
                        { key: 'whatsappAlerts', title: 'WHATSAPP CONCIERGE INTEGRATION', desc: 'Dispatch tracking links directly to my mobile number for zero-touch updates.' }
                      ].map(notif => (
                        <label key={notif.key} className="flex items-start justify-between gap-4 p-4 hover:bg-neutral-50/30 border border-neutral-100 cursor-pointer select-none">
                          <div className="flex-1">
                            <span className="text-[10px] tracking-widest font-semibold text-neutral-900 font-sans block">{notif.title}</span>
                            <span className="text-[10px] text-neutral-400 mt-0.5 leading-normal block">{notif.desc}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifPrefs[notif.key]}
                            onChange={e => {
                              const updated = { ...notifPrefs, [notif.key]: e.target.checked }
                              setNotifPrefs(updated)
                              toast.success('Signal preferences updated')
                            }}
                            className="accent-neutral-900 w-4 h-4 mt-0.5 cursor-pointer shrink-0"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CONCIERGE DESK (SUPPORT) */}
              {activeTab === 'support' && (
                <div className="space-y-6">
                  <div className="border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-display tracking-wide uppercase text-neutral-950">COUTURE CONCIERGE DESK</h2>
                    <p className="text-xs text-neutral-400 mt-1">Submit inquiries or request styling advice from our Bengaluru design atelier.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Support form */}
                    <form onSubmit={submitTicket} className="space-y-4">
                      <h3 className="text-xs tracking-wider uppercase font-semibold text-neutral-900">SUBMIT DIRECT TICKETER INQUIRY</h3>

                      <div className="space-y-1">
                        <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">INQUIRY CATEGORY</label>
                        <select
                          value={ticketForm.category}
                          onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })}
                          className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 text-xs outline-none focus:border-neutral-950 uppercase font-sans font-medium"
                        >
                          <option value="sizing">SIZING & LOOK ADVICE</option>
                          <option value="delivery">DELIVERY TIMELINE DELAY</option>
                          <option value="refund">REFUND OR TRANSIT ERROR</option>
                          <option value="stylist">EXECUTIVE STYLIST BOOKING</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">SUBJECT LINE</label>
                        <input
                          required
                          type="text"
                          placeholder="SUMMARY OF YOUR DOSSIER ENQUIRY"
                          value={ticketForm.subject}
                          onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value.toUpperCase() })}
                          className="w-full h-10 px-3 bg-neutral-50 focus:bg-white text-xs tracking-wider border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">DETAILED MESSAGE</label>
                        <Textarea
                          required
                          rows="4"
                          placeholder="PLEASE DESCRIBE YOUR REQUIREMENT OR TRANSACTION..."
                          value={ticketForm.message}
                          onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })}
                          className="w-full p-3 bg-neutral-50 focus:bg-white text-xs border border-neutral-200 focus:border-neutral-900 outline-none transition rounded-none uppercase font-medium"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-10 rounded-none bg-neutral-950 text-white hover:bg-neutral-800 text-xs tracking-widest uppercase font-semibold transition-all"
                      >
                        SUBMIT TICKETER DOSSIER
                      </Button>
                    </form>

                    {/* Active tickers listing */}
                    <div className="space-y-4">
                      <h3 className="text-xs tracking-wider uppercase font-semibold text-neutral-900">ACTIVE TICKETS ARCHIVE</h3>
                      {tickets.length === 0 ? (
                        <div className="border border-neutral-50 p-6 text-center text-xs text-neutral-400 uppercase">
                          No active tickets detected on this port.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {tickets.map(t => (
                            <div key={t.id} className="border border-neutral-100 p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono font-bold text-neutral-900">{t.id}</span>
                                <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border ${
                                  t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                  {t.status}
                                </span>
                              </div>
                              <h4 className="text-xs font-semibold text-neutral-950 uppercase">{t.subject}</h4>
                              <p className="text-[10px] text-neutral-400 leading-normal uppercase">{t.message}</p>
                              <div className="text-[8px] font-mono text-neutral-400 text-right uppercase border-t border-neutral-50 pt-1.5">{t.date}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="border border-neutral-100 p-4 space-y-2 text-xs uppercase font-sans">
                        <h4 className="font-semibold text-neutral-950">URGENT CONTACT CHANNELS</h4>
                        <p className="text-[10px] text-neutral-400 leading-normal">
                          For immediate response regarding live payment issues, you may utilize our secure hotline directly.
                        </p>
                        <div className="pt-2 space-y-1">
                          <p className="flex items-center gap-2 font-medium text-neutral-800"><Phone className="w-3.5 h-3.5 text-neutral-400" /> +91 80 4000 5000</p>
                          <p className="flex items-center gap-2 font-medium text-neutral-800"><Mail className="w-3.5 h-3.5 text-neutral-400" /> hello@velora.in</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PREFERENCES (SETTINGS) */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="border-b border-neutral-100 pb-4">
                    <h2 className="text-lg font-display tracking-wide uppercase text-neutral-950">COUTURE PREFERENCES</h2>
                    <p className="text-xs text-neutral-400 mt-1">Configure structural shopping options, region localization, or stylistic preferences.</p>
                  </div>

                  <div className="space-y-5 max-w-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">LOCALIZATION REGION</label>
                        <select
                          value={settingsPrefs.region}
                          onChange={e => {
                            setSettingsPrefs({ ...settingsPrefs, region: e.target.value })
                            toast.success('Region configuration synchronized')
                          }}
                          className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 text-xs outline-none focus:border-neutral-950 uppercase font-sans font-medium"
                        >
                          <option value="India">INDIA (DOMESTIC ATELIER)</option>
                          <option value="UAE">MIDDLE EAST (UAE)</option>
                          <option value="US">UNITED STATES (US)</option>
                          <option value="UK">UNITED KINGDOM (UK)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] tracking-widest font-mono text-neutral-400 uppercase">VALUATION CURRENCY</label>
                        <select
                          value={settingsPrefs.currency}
                          onChange={e => {
                            setSettingsPrefs({ ...settingsPrefs, currency: e.target.value })
                            toast.success('Valuation system updated')
                          }}
                          className="w-full h-10 px-3 bg-neutral-50 border border-neutral-200 text-xs outline-none focus:border-neutral-950 uppercase font-sans font-medium"
                        >
                          <option value="INR">INR (₹ INDIAN RUPEE)</option>
                          <option value="USD">USD ($ UNITED STATES DOLLAR)</option>
                          <option value="AED">AED (د.إ UAE DIRHAM)</option>
                        </select>
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100 my-6" />

                    <div className="space-y-3">
                      <h3 className="text-xs tracking-wider uppercase font-semibold text-neutral-950">AI STYLING PREFERENCES</h3>
                      <label className="flex items-start justify-between gap-4 p-4 hover:bg-neutral-50/30 border border-neutral-100 cursor-pointer select-none">
                        <div className="flex-1">
                          <span className="text-[10px] tracking-widest font-semibold text-neutral-900 font-sans block">ENABLE CONCIERGE STYLING</span>
                          <span className="text-[10px] text-neutral-400 mt-0.5 leading-normal block">Allow the AI Concierge assistant to access my viewed history to suggest tailored fits.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={settingsPrefs.stylingAdvice}
                          onChange={e => {
                            setSettingsPrefs({ ...settingsPrefs, stylingAdvice: e.target.checked })
                            toast.success('Concierge styling updated')
                          }}
                          className="accent-neutral-900 w-4 h-4 mt-0.5 cursor-pointer shrink-0"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
