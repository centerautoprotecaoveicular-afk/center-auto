# Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Leads PII Isolation (`/leads/{leadId}`)**: Lead documents contain PII (`nome`, `telefone`, `email`). Public visitors may only `create` a lead with `status == 'Novo'` and server timestamps (`request.time`). Only verified administrators (`isAdmin()`) may `get`, `update`, or `delete` leads, and only `isMasterAdmin()` may `list` leads.
2. **Carousel Media & Videos Integrity (`/carouselSlides/{slideId}`, `/carouselVideos/{videoId}`)**: Public visitors may read (`get`, `list`) slides and videos. Only verified administrators or active registered site editors (`isAdmin()`) may create, update, or delete slides and videos.
3. **Testimonials Moderation Gate (`/testimonials/{testimonialId}`)**: Public visitors may submit a testimonial only with `status == 'pending'`. Unauthenticated visitors may only read/list testimonials where `resource.data.status == 'approved'`. Only verified administrators may inspect pending/rejected reviews, change `status`, or delete reviews.
4. **Admin-Managed Site Editors Database (`/authorizedUsers/{userEmail}`)**:
   - Only `isMasterAdmin()` (`centerauto.protecaoveicular@gmail.com` with `email_verified == true`) may create, update, list, or delete documents in `/authorizedUsers/{userEmail}`.
   - A verified Google user may only `get` their own `/authorizedUsers/{request.auth.token.email.lower()}` document to verify authorization (`status == 'Ativo'`), preventing enumeration or snooping of other editors' emails/names.
   - Inactive editors (`status == 'Inativo'`) immediately lose write access to `/carouselSlides` and `/carouselVideos`.
5. **Immutable Creation Timestamps & Identity**: On every collection, `createdAt` must equal `request.time` at creation and remain unchanged on updates; `updatedAt` must equal `request.time` on both create and update; `email` and `createdBy` on `authorizedUsers` are immutable.
6. **Path ID & Payload Bounds**: Standard IDs must match `^[a-zA-Z0-9_-]+$` (`<= 128` chars); `authorizedUsers` IDs must match lowercase email regex (`<= 150` chars); every string field has strict `.size()` bounds and strict `hasAll` / `hasOnly` key allowlists.

## 2. The "Dirty Dozen" Attack Payloads (All Must Return PERMISSION_DENIED)
1. **PII Leak via Unauthenticated List on Leads**: `getDocs(collection(db, 'leads'))` without master admin auth -> DENIED.
2. **PII Leak via Non-Admin Signed-In Get on Lead**: `getDoc(doc(db, 'leads', 'lead_1'))` with random verified Google account -> DENIED.
3. **Lead Shadow Field Injection**: `setDoc(doc(db, 'leads', 'lead_2'), { ...validLead, isAdmin: true })` -> DENIED (`hasOnly` rejects `isAdmin`).
4. **Lead Fake Status Bypass on Create**: `setDoc(doc(db, 'leads', 'lead_3'), { ...validLead, status: 'Convertido' })` -> DENIED (`status == 'Novo'` enforced).
5. **Self-Authorization Attack on `authorizedUsers`**: Random Google user tries `setDoc(doc(db, 'authorizedUsers', myEmail), { ...validUser })` -> DENIED (`isMasterAdmin()` required).
6. **Cross-Editor PII Snooping**: Editor A tries `getDoc(doc(db, 'authorizedUsers', editorB_email))` or `getDocs(collection(db, 'authorizedUsers'))` -> DENIED.
7. **Revoked Editor Write Attack**: An editor whose `status` was changed to `'Inativo'` attempts `setDoc` on `carouselSlides` or `carouselVideos` -> DENIED (`status == 'Ativo'` enforced in `isAdmin()`).
8. **Testimonial Self-Approval & Pending Scraping**: Public visitor submits `status: 'approved'` or runs `getDocs(collection(db, 'testimonials'))` without `where('status', '==', 'approved')` -> DENIED.
9. **Unauthorized Carousel / Video Tampering**: Random Google user not in `authorizedUsers` attempts `setDoc` on `carouselSlides` or `carouselVideos` -> DENIED.
10. **Email Spoofing Attack**: Signed-in user with `email == 'centerauto.protecaoveicular@gmail.com'` and `email_verified == false` attempts admin read/write -> DENIED (`email_verified == true` enforced).
11. **Path ID Poisoning**: Creating `/leads/${'a'.repeat(200)}` or `/authorizedUsers/invalid..email` -> DENIED (`isValidId` / `isValidEmailId` rejects).
12. **Resource Exhaustion / Oversized String**: Creating a slide, testimonial, or authorized user with an oversized string -> DENIED (`size()` limits enforced).
