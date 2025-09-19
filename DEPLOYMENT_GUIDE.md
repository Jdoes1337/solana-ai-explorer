# 🚀 Solana AI Explorer - Deployment Guide

## 🌐 Cloud Deployment Options

Your Solana AI Explorer is ready for deployment to various cloud platforms. Choose the option that best fits your needs:

## Option 1: Railway (Recommended for Full-Stack Apps)

**Best for**: Complete applications with databases
**Cost**: $5/month for hobby plan
**Setup time**: 5 minutes

### Steps:
1. **Sign up**: Go to [railway.app](https://railway.app)
2. **Connect GitHub**: Link your repository
3. **Deploy**: Click "Deploy from GitHub repo"
4. **Add Services**:
   - PostgreSQL database
   - Redis cache
5. **Set Environment Variables**:
   ```
   OPENAI_API_KEY=your_key_here
   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   HELIUS_API_KEY=your_helius_key (optional)
   JWT_SECRET=your_random_secret
   ```
6. **Deploy**: Railway will automatically build and deploy

## Option 2: Vercel (Serverless)

**Best for**: API-focused deployments
**Cost**: Free tier available
**Setup time**: 3 minutes

### Steps:
1. **Sign up**: Go to [vercel.com](https://vercel.com)
2. **Import Project**: Connect your GitHub repository
3. **Configure**:
   - Framework: Node.js
   - Build Command: `npm install`
   - Output Directory: `client`
4. **Set Environment Variables** in Vercel dashboard
5. **Deploy**: Automatic deployment on git push

**Note**: You'll need external database services (PlanetScale, Supabase) for Vercel.

## Option 3: Render (Full-Stack)

**Best for**: Complete applications with managed services
**Cost**: $7/month for web service + database
**Setup time**: 10 minutes

### Steps:
1. **Sign up**: Go to [render.com](https://render.com)
2. **Create Web Service**: Connect GitHub repo
3. **Add Database**: PostgreSQL service
4. **Add Redis**: Redis service
5. **Configure Environment Variables**
6. **Deploy**: Automatic deployment

## Option 4: DigitalOcean App Platform

**Best for**: Production applications
**Cost**: $12/month for basic plan
**Setup time**: 15 minutes

### Steps:
1. **Sign up**: Go to [digitalocean.com](https://digitalocean.com)
2. **Create App**: Connect GitHub repository
3. **Add Components**:
   - Web service (Node.js)
   - PostgreSQL database
   - Redis cache
4. **Configure Environment Variables**
5. **Deploy**: Automatic deployment

## Option 5: AWS/GCP/Azure (Enterprise)

**Best for**: Large-scale production
**Cost**: Variable (can be expensive)
**Setup time**: 30+ minutes

### AWS Setup:
1. **EC2 Instance**: Deploy using Docker
2. **RDS**: Managed PostgreSQL
3. **ElastiCache**: Managed Redis
4. **Load Balancer**: For high availability
5. **CloudFront**: CDN for static assets

## 🔧 Required Environment Variables

Set these in your chosen platform:

```env
# Required
OPENAI_API_KEY=sk-your-openai-key-here
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port

# Optional but recommended
HELIUS_API_KEY=your-helius-key
JWT_SECRET=your-random-secret-key
NODE_ENV=production
```

## 🗄️ Database Setup

### For Railway/Render/DigitalOcean:
- Use their managed PostgreSQL services
- Database will be automatically created
- Connection string provided in environment variables

### For Vercel (External Database):
- **Supabase**: Free PostgreSQL with good performance
- **PlanetScale**: MySQL-compatible, serverless
- **Neon**: Serverless PostgreSQL

## 📊 Redis Setup

### Managed Redis Services:
- **Redis Cloud**: Free tier available
- **Upstash**: Serverless Redis
- **AWS ElastiCache**: For AWS deployments

## 🚀 Quick Deploy Commands

### Railway:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Vercel:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🔒 SSL and Domain Setup

Most platforms provide free SSL certificates:
- **Railway**: Automatic SSL with custom domains
- **Vercel**: Automatic SSL with custom domains
- **Render**: Automatic SSL with custom domains

## 📈 Monitoring and Analytics

### Built-in Monitoring:
- Health check endpoint: `/api/health`
- Detailed system info: `/api/health/detailed`

### Recommended Add-ons:
- **Sentry**: Error tracking
- **LogRocket**: User session replay
- **Google Analytics**: Usage analytics

## 💰 Cost Comparison

| Platform | Monthly Cost | Database | Redis | SSL | Custom Domain |
|----------|-------------|----------|-------|-----|---------------|
| Railway | $5 | ✅ | ✅ | ✅ | ✅ |
| Vercel | Free | ❌* | ❌* | ✅ | ✅ |
| Render | $7 | ✅ | ✅ | ✅ | ✅ |
| DigitalOcean | $12 | ✅ | ✅ | ✅ | ✅ |

*Requires external services

## 🎯 Recommended Deployment Path

**For beginners**: Start with **Railway**
- Easiest setup
- Includes database and Redis
- Good free tier
- Automatic deployments

**For production**: Use **Render** or **DigitalOcean**
- More control
- Better performance
- Professional support

## 🔄 Continuous Deployment

All platforms support automatic deployments:
1. Push to GitHub
2. Platform detects changes
3. Automatic build and deploy
4. Zero-downtime deployments

## 📞 Support

If you need help with deployment:
1. Check platform documentation
2. Review environment variables
3. Check logs in platform dashboard
4. Test health endpoints

---

**Ready to deploy?** Choose your platform and follow the steps above!
