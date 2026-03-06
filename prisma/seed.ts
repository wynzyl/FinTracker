// prisma/seed.ts
// CHO-IS Multi-facility seed (Production-ready, idempotent):
// - Seeds facilities: MAIN, CHO1, CHO2, CHO3
// - Seeds admin account (ADMIN + CITY_WIDE) assigned to MAIN
// - Optionally seeds demo users per role + facility (DEV only)
// - Writes audit logs ONLY when records are newly created (not every re-run)
//
// Required env vars:
//   ADMIN_EMAIL
//   ADMIN_PASSWORD
// Optional:
//   ADMIN_NAME
//   SEED_DEMO_USERS=true
//   DEMO_PASSWORD
//   MAIN_ADDRESS, CHO1_ADDRESS, CHO2_ADDRESS, CHO3_ADDRESS
//
// Notes:
// - MAIN-only lab rule is enforced in application logic; seed ensures LAB demo user is in MAIN.
// - This seed intentionally does NOT create patient/encounter medical data.

import { PrismaClient, Role, UserScope, FacilityType, AuditAction } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing required env var: ${name}`);
  return v.trim();
}

function envBool(name: string, defaultValue = false): boolean {
  const v = (process.env[name] || "").trim().toLowerCase();
  if (!v) return defaultValue;
  return v === "true" || v === "1" || v === "yes";
}

async function main() {
  // Run seeds as a single transaction so partial seeds don’t happen.
  await prisma.$transaction(async (tx) => {
    // 1) Facilities first (mandatory)
    const facilityDefs = [
      { code: "MAIN", name: "Urdaneta City Health Office - Main", type: FacilityType.MAIN, address: process.env.MAIN_ADDRESS ?? null },
      { code: "CHO1", name: "CHO Branch 1", type: FacilityType.BARANGAY, address: process.env.CHO1_ADDRESS ?? null },
      { code: "CHO2", name: "CHO Branch 2", type: FacilityType.BARANGAY, address: process.env.CHO2_ADDRESS ?? null },
      { code: "CHO3", name: "CHO Branch 3", type: FacilityType.BARANGAY, address: process.env.CHO3_ADDRESS ?? null },
    ] as const;

    const facilities: Record<string, { id: string; code: string }> = {};

    for (const f of facilityDefs) {
      const existing = await tx.facility.findUnique({ where: { code: f.code } });

      const facility = existing
        ? await tx.facility.update({
            where: { code: f.code },
            data: { name: f.name, type: f.type, address: f.address, isActive: true, deletedAt: null, deletedById: null },
          })
        : await tx.facility.create({
            data: { code: f.code, name: f.name, type: f.type, address: f.address, isActive: true },
          });

      facilities[f.code] = { id: facility.id, code: facility.code };

      if (!existing) {
        await tx.auditLog.create({
          data: {
            userId: null,
            action: AuditAction.CREATE,
            entity: "Facility",
            entityId: facility.id,
            metadata: { seed: true, code: f.code, name: f.name },
          },
        });
      }
    }

    // 2) Admin user (CITY_WIDE), assigned to MAIN
    const adminEmail = mustGetEnv("ADMIN_EMAIL");
    const adminPassword = mustGetEnv("ADMIN_PASSWORD");
    const adminName = (process.env.ADMIN_NAME?.trim() || "CHO Admin");

    const adminExisting = await tx.user.findUnique({ where: { email: adminEmail } });
    const adminHash = await bcrypt.hash(adminPassword, 12);

    const admin = adminExisting
      ? await tx.user.update({
          where: { email: adminEmail },
          data: {
            name: adminName,
            role: Role.ADMIN,
            scope: UserScope.CITY_WIDE,
            facilityId: facilities["MAIN"].id,
            isActive: true,
            passwordHash: adminHash,
            deletedAt: null,
            deletedById: null,
          },
        })
      : await tx.user.create({
          data: {
            email: adminEmail,
            name: adminName,
            role: Role.ADMIN,
            scope: UserScope.CITY_WIDE,
            facilityId: facilities["MAIN"].id,
            isActive: true,
            passwordHash: adminHash,
          },
        });

    if (!adminExisting) {
      await tx.auditLog.create({
        data: {
          userId: admin.id,
          action: AuditAction.CREATE,
          entity: "User",
          entityId: admin.id,
          metadata: { seed: true, role: "ADMIN", scope: "CITY_WIDE", email: adminEmail, facility: "MAIN" },
        },
      });
    }

    // 3) Optional demo users (DEV only)
    const seedDemo = envBool("SEED_DEMO_USERS", false);
    if (seedDemo) {
      const demoPassword = (process.env.DEMO_PASSWORD?.trim() || "P@ssw0rd123!");
      const demoHash = await bcrypt.hash(demoPassword, 12);

      const demos = [
        // CHO1
        { email: "triage1@cho.local", name: "Triage CHO1", role: Role.TRIAGE, facilityCode: "CHO1" },
        { email: "doctor1@cho.local", name: "Doctor CHO1", role: Role.DOCTOR, facilityCode: "CHO1" },
        { email: "pharmacy1@cho.local", name: "Pharmacy CHO1", role: Role.PHARMACY, facilityCode: "CHO1" },
        // CHO2
        { email: "triage2@cho.local", name: "Triage CHO2", role: Role.TRIAGE, facilityCode: "CHO2" },
        { email: "doctor2@cho.local", name: "Doctor CHO2", role: Role.DOCTOR, facilityCode: "CHO2" },
        { email: "pharmacy2@cho.local", name: "Pharmacy CHO2", role: Role.PHARMACY, facilityCode: "CHO2" },
        // CHO3
        { email: "triage3@cho.local", name: "Triage CHO3", role: Role.TRIAGE, facilityCode: "CHO3" },
        { email: "doctor3@cho.local", name: "Doctor CHO3", role: Role.DOCTOR, facilityCode: "CHO3" },
        { email: "pharmacy3@cho.local", name: "Pharmacy CHO3", role: Role.PHARMACY, facilityCode: "CHO3" },
        // MAIN-only LAB
        { email: "lab@cho.local", name: "Lab MAIN", role: Role.LAB, facilityCode: "MAIN" },
      ] as const;

      for (const d of demos) {
        const facilityId = facilities[d.facilityCode].id;

        const existing = await tx.user.findUnique({ where: { email: d.email } });
        const user = existing
          ? await tx.user.update({
              where: { email: d.email },
              data: {
                name: d.name,
                role: d.role,
                scope: UserScope.FACILITY_ONLY,
                facilityId,
                isActive: true,
                passwordHash: demoHash,
                deletedAt: null,
                deletedById: null,
              },
            })
          : await tx.user.create({
              data: {
                email: d.email,
                name: d.name,
                role: d.role,
                scope: UserScope.FACILITY_ONLY,
                facilityId,
                isActive: true,
                passwordHash: demoHash,
              },
            });

        if (!existing) {
          await tx.auditLog.create({
            data: {
              userId: admin.id,
              action: AuditAction.CREATE,
              entity: "User",
              entityId: user.id,
              metadata: { seed: true, role: d.role, scope: "FACILITY_ONLY", email: d.email, facility: d.facilityCode, createdBy: adminEmail },
            },
          });
        }
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
