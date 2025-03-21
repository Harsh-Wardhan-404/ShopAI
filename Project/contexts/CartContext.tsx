// contexts/CartContext.tsx
"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from "react"

type CartItem = {
  productId: number
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  
  // Load cart from localStorage on first render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart data", error)
      }
    }
  }, [])
  
  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])
  
  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.productId === newItem.productId
      )
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += 1
        return updatedItems
      } else {
        return [...prevItems, { ...newItem, quantity: 1 }]
      }
    })
  }
  
  const removeItem = (productId: number) => {
    setItems(prevItems => 
      prevItems.filter(item => item.productId !== productId)
    )
  }
  
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity } 
          : item
      )
    )
  }
  
  const clearCart = () => {
    setItems([])
  }
  
  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity, 
    0
  )
  
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  )
  
  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addItem, 
        removeItem, 
        updateQuantity, 
        clearCart, 
        totalItems, 
        totalPrice 
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}