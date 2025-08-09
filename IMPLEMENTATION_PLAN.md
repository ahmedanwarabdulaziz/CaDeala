# Post-Purchase Registration System - Implementation Plan

## 🎯 Overview

**Scenario**: Customer completes purchase → Cashier offers QR code scan → Customer registers → Gets points/rewards for current purchase

**Example**: Mary buys $40 pizza → Scans QR code → Registers → Gets 40 points + 10% off next visit

## 🏗️ Database Schema Changes

### 1. Customer Types & Business Associations
```sql
-- Add customer type and business association
ALTER TABLE users ADD COLUMN customer_type ENUM('public', 'business_specific') DEFAULT 'public';
ALTER TABLE users ADD COLUMN registering_business_id UUID REFERENCES businesses(id);
ALTER TABLE users ADD COLUMN access_level ENUM('exclusive', 'cross_business', 'public') DEFAULT 'exclusive';

-- Track customer registrations
CREATE TABLE customer_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id),
  business_id UUID REFERENCES businesses(id),
  registration_method ENUM('qr_code', 'link', 'app') NOT NULL,
  purchase_amount DECIMAL(10,2),
  purchase_details JSONB,
  points_awarded INTEGER DEFAULT 0,
  welcome_gift_awarded BOOLEAN DEFAULT false,
  registration_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Business registration links and QR codes
CREATE TABLE business_registration_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  unique_code VARCHAR(50) UNIQUE NOT NULL,
  qr_code_url TEXT,
  landing_page_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reward configurations
CREATE TABLE business_reward_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  reward_type ENUM('points', 'discount', 'gift_card', 'free_service') NOT NULL,
  points_per_dollar DECIMAL(5,2) DEFAULT 1.0,
  welcome_points INTEGER DEFAULT 0,
  welcome_discount_percent DECIMAL(5,2),
  welcome_gift_card_amount DECIMAL(10,2),
  welcome_free_service TEXT,
  is_automatic BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customer points and rewards
CREATE TABLE customer_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id),
  business_id UUID REFERENCES businesses(id),
  points INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Points transactions
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id),
  business_id UUID REFERENCES businesses(id),
  transaction_type ENUM('earned', 'redeemed', 'expired') NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  reference_id UUID, -- Links to customer_registrations or other relevant table
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 User Interface Components

### 1. Business Dashboard - QR Code Management
```typescript
// Components needed:
- QRCodeGenerator.tsx
- BusinessRegistrationLinks.tsx
- RewardConfiguration.tsx
- CustomerRegistrations.tsx
- PointsManagement.tsx
```

### 2. Customer Registration Flow
```typescript
// Components needed:
- QRCodeScanner.tsx
- BusinessRegistrationPage.tsx
- WelcomeRewards.tsx
- PointsDisplay.tsx
```

### 3. Business Notifications
```typescript
// Components needed:
- CustomerRegistrationNotification.tsx
- RewardSelectionModal.tsx
- PointsAwardModal.tsx
```

## 🚀 Implementation Phases

### Phase 1: Core Foundation (Week 1-2)

#### 1.1 Database Schema Implementation
- [ ] Add customer type fields to users table
- [ ] Create customer_registrations table
- [ ] Create business_registration_links table
- [ ] Create business_reward_configs table
- [ ] Create customer_points table
- [ ] Create points_transactions table

#### 1.2 QR Code System
- [ ] QR code generation API
- [ ] Unique code generation for businesses
- [ ] Business registration link creation
- [ ] QR code display in business dashboard

#### 1.3 Basic Registration Flow
- [ ] QR code scanner component
- [ ] Business-specific registration page
- [ ] Customer type assignment
- [ ] Basic points calculation

### Phase 2: Reward System (Week 3-4)

#### 2.1 Reward Configuration
- [ ] Business reward settings page
- [ ] Pre-set automatic rewards
- [ ] Points per dollar configuration
- [ ] Welcome gift configuration

#### 2.2 Points System
- [ ] Points calculation and storage
- [ ] Points display for customers
- [ ] Points transaction history
- [ ] Points redemption system

#### 2.3 Notification System
- [ ] Real-time notifications for business owners
- [ ] Customer registration alerts
- [ ] Points awarded notifications
- [ ] Welcome gift notifications

### Phase 3: Enhanced Features (Week 5-6)

#### 3.1 Customer Access Control
- [ ] Business-specific customer restrictions
- [ ] Cross-business access settings
- [ ] Public access configuration
- [ ] Customer access management

#### 3.2 Analytics Dashboard
- [ ] Customer registration analytics
- [ ] Points usage analytics
- [ ] Reward effectiveness tracking
- [ ] Business performance metrics

#### 3.3 Advanced Features
- [ ] Time-based rewards
- [ ] Purchase-based rewards
- [ ] Loyalty tiers
- [ ] Personalized offers

## 🎯 Key Features to Implement

### 1. QR Code Generation
```typescript
// API endpoint: /api/businesses/[id]/qr-code
interface QRCodeResponse {
  qrCodeUrl: string;
  registrationUrl: string;
  uniqueCode: string;
  businessInfo: {
    name: string;
    logo: string;
    description: string;
  };
}
```

### 2. Customer Registration Flow
```typescript
// Registration endpoint: /api/register/business/[businessId]
interface BusinessRegistrationRequest {
  businessId: string;
  customerData: {
    email: string;
    name: string;
    phone?: string;
  };
  purchaseAmount?: number;
  purchaseDetails?: any;
}
```

### 3. Reward System
```typescript
// Reward configuration interface
interface RewardConfig {
  pointsPerDollar: number;
  welcomePoints: number;
  welcomeDiscountPercent?: number;
  welcomeGiftCardAmount?: number;
  welcomeFreeService?: string;
  isAutomatic: boolean;
}
```

### 4. Points System
```typescript
// Points calculation
interface PointsCalculation {
  basePoints: number; // Based on purchase amount
  welcomePoints: number; // Welcome bonus
  totalPoints: number;
  pointsPerDollar: number;
}
```

## 🎨 UI/UX Design Considerations

### 1. QR Code Display
- **Business Dashboard**: Large, printable QR code
- **Mobile-Friendly**: Easy to scan with phone camera
- **Branded**: Include business logo and colors
- **Instructions**: Clear scanning instructions

### 2. Registration Flow
- **Simple**: Minimal steps to register
- **Fast**: Quick registration process
- **Rewarding**: Immediate feedback and rewards
- **Branded**: Business-specific design

### 3. Business Notifications
- **Real-time**: Instant notifications
- **Actionable**: Clear next steps
- **Informative**: Customer details and purchase info
- **Reward Options**: Easy reward selection

## 🧪 Testing Strategy

### 1. Unit Tests
- [ ] QR code generation
- [ ] Points calculation
- [ ] Reward distribution
- [ ] Customer registration

### 2. Integration Tests
- [ ] End-to-end registration flow
- [ ] Business notification system
- [ ] Points system integration
- [ ] Reward system integration

### 3. User Testing
- [ ] QR code scanning experience
- [ ] Registration flow usability
- [ ] Business dashboard functionality
- [ ] Reward system effectiveness

## 🎯 Success Metrics

### Business Metrics
- **Registration Rate**: % of customers who register after purchase
- **Points Redemption**: % of points redeemed
- **Customer Retention**: Repeat customer visits
- **Revenue Impact**: Increase in customer spending

### Platform Metrics
- **QR Code Usage**: Number of scans per business
- **Registration Conversion**: % of scans that lead to registration
- **User Engagement**: Points usage and reward redemption
- **Business Adoption**: % of businesses using QR codes

## 🚀 Next Steps

1. **Start with Phase 1**: Core database schema and QR code generation
2. **Build MVP**: Basic registration flow with points
3. **Test with Real Business**: Pilot with one restaurant
4. **Iterate and Improve**: Based on feedback and usage data
5. **Scale**: Roll out to more businesses

Would you like me to start implementing any specific part of this system?
