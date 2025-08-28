// Debug Forms API
console.log("🔍 Debugging Forms API Issues...\n");

console.log("📋 Common API Request Failures:");
console.log("1. 🔐 Authentication Issues:");
console.log("   • Session expired or invalid");
console.log("   • Not logged in as admin");
console.log("   • CSRF token issues");

console.log("\n2. 🌐 Network Issues:");
console.log("   • Server not running (check npm run dev)");
console.log("   • Port conflicts (default: localhost:3000)");
console.log("   • CORS issues");
console.log("   • Request timeout");

console.log("\n3. 📝 API Route Issues:");
console.log("   • Syntax errors in route files");
console.log("   • Missing dependencies");
console.log("   • Database connection issues");
console.log("   • Invalid form ID in URL");

console.log("\n4. 🗄️ Database Issues:");
console.log("   • Prisma client not initialized");
console.log("   • Database schema mismatch");
console.log("   • Connection string invalid");

console.log("\n🛠️ Debugging Steps:");
console.log("\n1. Check Browser Console (F12):");
console.log("   • Look for JavaScript errors");
console.log("   • Check Network tab for failed requests");
console.log("   • Verify request URL and method");
console.log("   • Check response status code");

console.log("\n2. Check Server Terminal:");
console.log("   • Look for compilation errors");
console.log("   • Check for runtime errors");
console.log("   • Verify server is running on port 3000");

console.log("\n3. Test API Endpoints:");
console.log("   • GET /api/forms (list forms)");
console.log("   • GET /api/forms/[id] (get specific form)");
console.log("   • POST /api/forms/[id]/respond (send response)");

console.log("\n4. Verify Authentication:");
console.log("   • Check if logged in as admin");
console.log("   • Verify session is valid");
console.log("   • Test with fresh login");

console.log("\n🔧 Quick Fixes:");
console.log("\n1. 🔄 Restart Everything:");
console.log("   • Stop server (Ctrl+C)");
console.log("   • Run 'npm run dev' again");
console.log("   • Refresh browser");
console.log("   • Clear browser cache");

console.log("\n2. 🔐 Re-authenticate:");
console.log("   • Log out of admin");
console.log("   • Log back in");
console.log("   • Try accessing forms again");

console.log("\n3. 🗄️ Check Database:");
console.log("   • Verify .env.local has DATABASE_URL");
console.log("   • Run 'npx prisma db push' if needed");
console.log("   • Check if forms exist in database");

console.log("\n📊 Test URLs to Try:");
console.log("• http://localhost:3000/api/forms");
console.log("• http://localhost:3000/admin/forms");
console.log("• Check if specific form ID exists");

console.log("\n🎯 Most Likely Causes:");
console.log("1. Session expired - need to re-login");
console.log("2. Server restart needed");
console.log("3. Form ID doesn't exist in database");
console.log("4. Authentication middleware blocking request");

console.log("\n💡 Next Steps:");
console.log("1. Open browser dev tools (F12)");
console.log("2. Go to Network tab");
console.log("3. Try to load the form again");
console.log("4. Check what request fails and why");
console.log("5. Share the exact error from Network tab");