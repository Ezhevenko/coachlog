export function createMockSupabase() {
  const db: Record<string, any[]> = {
    workouts: [],
    workout_exercises: [],
    users: [{ id: 'user1' }],
    client_links: [],
    user_roles: [],
    exercises: [],
    exercise_categories: [],
    exercise_progress: []
  }

  class Query {
    table: any[]
    filters: ((row: any) => boolean)[] = []
    columns: string | undefined
    singleRow = false
    action: 'select' | 'insert' | 'update' | 'delete' | null = null
    data: any
    constructor(table: any[]) { this.table = table }
    select(cols: string) { this.action = 'select'; this.columns = cols; return this }
    insert(data: any) { if (Array.isArray(data)) this.table.push(...data); else this.table.push(data); return Promise.resolve({ error: null, data }) }
    update(data: any) { this.action = 'update'; this.data = data; return this }
    delete() { this.action = 'delete'; return this }
    eq(col: string, val: any) { this.filters.push(r => r[col] === val); return this }
    in(col: string, vals: any[]) { this.filters.push(r => vals.includes(r[col])); return this }
    single() { this.singleRow = true; return this }
    async then(resolve: any) { const res = await this.execute(); resolve(res) }
    async execute() {
      let rows = this.table.filter(row => this.filters.every(f => f(row)))
      if (this.action === 'update') {
        rows.forEach(r => Object.assign(r, this.data))
        return { error: null }
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
      if (this.singleRow) data = rows[0] || null
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
