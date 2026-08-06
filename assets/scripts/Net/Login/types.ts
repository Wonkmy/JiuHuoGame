// ⚠️ 此文件由 generate-schema.ts 自动生成，请勿手动修改
// 纯类型定义，可直接提供给客户端同事使用（无任何运行时依赖）

// 通用 API 响应包装类型（供客户端统一处理 data / error）
export type ApiResponse<T> = {
  data?: T
  error?: string
};

// ---------- 用户表 ----------
export interface User {
  id: number
  name: string
  email: string
  age: number | null
  openid: string | null
  unionid: string | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

// 创建时提交的字段（用户表）
export type NewUser = {
  id?: number
  name: string
  email: string
  age?: number | null
  openid?: string | null
  unionid?: string | null
  is_active?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

// ---------- 玩家表 ----------
export interface Player {
  id: number
  username: string
  level: number | null
  score: number | null
  items: any | null
  created_at: string | null
}

// 创建时提交的字段（玩家表）
export type NewPlayer = {
  id?: number
  username: string
  level?: number | null
  score?: number | null
  items?: any | null
  created_at?: string | null
}

// ---------- 物品表 ----------
export interface Item {
  id: number
  name: string
  price: string
  created_at: string | null
  updated_at: string | null
}

// 创建时提交的字段（物品表）
export type NewItem = {
  id?: number
  name: string
  price: string
  created_at?: string | null
  updated_at?: string | null
}

