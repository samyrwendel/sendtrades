export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          email: string
          password: string
          name: string | null
          plan: string
          active: boolean
          createdAt: Date
          updatedAt: Date
        }
      }
      Bots: {
        Row: {
          id: string
          userId: string
          name: string
          public_id: string
          tradingPair: string
          active: boolean
          exchange: Json
          webhook: Json
          settings: Json
          statistics: Json
          createdAt: Date
          updatedAt: Date
          lastCheck: Date | null
          lastTrade: Date | null
          status: string
        }
      }
      BotLog: {
        Row: {
          id: string
          botId: string
          type: string
          message: string
          data: Json | null
          createdAt: Date
        }
      }
      Order: {
        Row: {
          id: string
          botId: string
          symbol: string
          side: string
          type: string
          status: string
          price: number
          quantity: number
          quoteQuantity: number
          commission: number
          commissionAsset: string
          createdAt: Date
          updatedAt: Date
          data: Json | null
        }
      }
      ApiKey: {
        Row: {
          id: string
          userId: string
          exchange: string
          name: string
          key: string
          secret: string
          active: boolean
          createdAt: Date
          updatedAt: Date
        }
      }
    }
  }
} 