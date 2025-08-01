export function createMockSupabase() {
  const db: Record<string, any[]> = {
    workouts: [],
    workout_exercises: [],
    users: [{ id: 'user1' }, { id: 'user2' }, { id: 'c1' }],
    client_links: [{ client_id: 'c1', coach_id: 'user1' }],
    user_roles: [],
    exercises: [],
    exercise_categories: [],
    client_packages: [],
    package_history: [],
    exercise_progress: [],
    active_roles: [],
    client_invites: []
  }

  class Query {
    table: any[]
    filters: ((row: any) => boolean)[] = []
    columns: string | undefined
    singleRow = false
    action: 'select' | 'insert' | 'update' | 'delete' | 'upsert' | null = null
    data: any
    options: any
    orderColumn: string | null = null
    orderAsc = true
    constructor(table: any[]) { this.table = table }
    select(cols: string) { this.action = 'select'; this.columns = cols; return this }
    insert(data: any) { if (Array.isArray(data)) this.table.push(...data); else this.table.push(data); return Promise.resolve({ error: null, data }) }
    upsert(data: any, options?: any) { this.action = 'upsert'; this.data = data; this.options = options; return this }
    update(data: any) { this.action = 'update'; this.data = data; return this }
    delete() { this.action = 'delete'; return this }
    eq(col: string, val: any) { this.filters.push(r => r[col] === val); return this }
    in(col: string, vals: any[]) { this.filters.push(r => vals.includes(r[col])); return this }
    order(col: string, opts?: { ascending?: boolean }) { this.orderColumn = col; this.orderAsc = opts?.ascending !== false; return this }
    single() { this.singleRow = true; return this }
    async then(resolve: any) { const res = await this.execute(); resolve(res) }
    async execute() {
      let rows = this.table.filter(row => this.filters.every(f => f(row)))
      if (this.orderColumn) {
        const c = this.orderColumn
        const asc = this.orderAsc
        rows = rows.slice().sort((a,b) => {
          if (a[c] < b[c]) return asc ? -1 : 1
          if (a[c] > b[c]) return asc ? 1 : -1
          return 0
        })
      }
      if (this.action === 'update') {
        rows.forEach(r => Object.assign(r, this.data))
        return { error: null }
      }
      if (this.action === 'upsert') {
        const key = this.options?.onConflict || 'id'
        const items = Array.isArray(this.data) ? this.data : [this.data]
        for (const item of items) {
          const existing = this.table.find(r => r[key] === item[key])
          if (existing) Object.assign(existing, item)
          else this.table.push(item)
        }
        return { error: null, data: this.data }
      }
      if (this.action === 'delete') {
        this.table = this.table.filter(row => !rows.includes(row))
        db[(this as any).tableName] = this.table
        return { error: null }
      }
      let data = rows
      if (this.columns && this.columns !== '*') {
        const fields = this.columns.split(',').map(s => s.trim())
        data = rows.map(r => {
          const o: any = {}
          for (const f of fields) o[f] = r[f]
          return o
        })
      }
      if (this.singleRow) {
        if (rows.length > 1) {
          return { data: null, error: { message: 'Multiple rows returned' } }
        }
        data = rows[0] || null
      }
      return { data, error: null }
    }
  }

  return {
    from(tableName: string) {
      const table = db[tableName] || (db[tableName] = [])
      const q = new Query(table)
      ;(q as any).tableName = tableName
      return q
    }
  }
}
