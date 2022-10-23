import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
        const newCart = [...cart]
        const existProduct = newCart.find(product => product.id === productId)

        const stock = await api.get(`stock/${productId}`)
        const stockAmount = stock.data.amount
        const currentAmount = existProduct ? existProduct.amount : 0
        const amount = currentAmount + 1

        if(amount > stockAmount) {
          toast.error('Quantidade solicitada fora de estoque');
          return
        }

        if(existProduct) {
          existProduct.amount = amount
        }else {
          const product = await api.get(`products/${productId}`)
          const newProduct = {
            ...product.data,
            amount: 1
          }
          newCart.push(newProduct)
        }
        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productsClicked = cart.find(product => product.id === productId)
      const newArray = cart.filter((product) => {
        return product.id !== productsClicked?.id
      })
      
      setCart(newArray)
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
