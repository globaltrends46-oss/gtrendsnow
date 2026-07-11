/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const superusers = app.findCollectionByNameOrId("_superusers")
    const record = new Record(superusers)
    
    const email = $os.getenv("PB_SUPERUSER_EMAIL") || $os.getenv("POCKETBASE_ADMIN_EMAIL") || "admin@gtrendsnow.com"
    const password = $os.getenv("PB_SUPERUSER_PASSWORD") || $os.getenv("POCKETBASE_ADMIN_PASSWORD") || "SecureAdminPass123!"
    
    record.set("email", email)
    record.set("password", password)
    
    app.save(record)
})
