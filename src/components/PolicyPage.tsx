import { useTranslation } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";
export function PolicyPage({ kind }: { kind: "privacy" | "terms" }) {
  const { t } = useTranslation();
  const sections =
    kind === "privacy"
      ? [
          [
            "Information we collect",
            "Your email, profile, experience, equipment, goals, benchmarks, check-ins (including sleep, stress and soreness), injuries or limitations, free-text notes, and workout logs are stored with your account.",
          ],
          [
            "Why we use it",
            "We use this information to manage your account, tailor sessions and loads, keep training history, and show progress. Injury and health-related notes are optional. Do not include information you do not want processed.",
          ],
          [
            "Service providers",
            "Lovable Cloud provides hosting, account services and database storage. When you request an AI adjustment, the AI model provider receives session text and your adjustment note, which may include injury information. We minimize the data sent and do not send your email or account name as part of that request.",
          ],
          [
            "Analytics",
            "Anonymous usage analytics are currently disabled. No app-specific analytics events are collected. Hosting providers may process operational records necessary to run and secure the service.",
          ],
          [
            "Retention",
            "Account and workout information is retained while your account is active. Deleting your account removes its associated application records. Providers may retain backups or operational records for their own limited retention periods; exact backup schedules have not yet been confirmed.",
          ],
          [
            "Your choices and rights",
            "You can review and correct your profile, download your data as JSON in Profile, or delete your account there. Depending on your location you may have access, correction, deletion, portability or restriction rights. A dedicated public support contact has not yet been established.",
          ],
          [
            "Security and changes",
            "We restrict account data to its owner and use authenticated requests. No online service can guarantee absolute security. This policy may change as the service evolves.",
          ],
        ]
      : [
          [
            "Eligibility and agreement",
            `You must be 18 or older to use ${BRAND.name}. By accepting these terms you agree to them and the Privacy Policy. Keep your account credentials secure.`,
          ],
          [
            "Exercise and medical safety",
            `${BRAND.name} is not medical advice, diagnosis or treatment. Consult a physician before starting or changing exercise, especially with injuries or health conditions. Stop if you experience pain, dizziness or unusual symptoms. AI adjustments are not a medical assessment.`,
          ],
          [
            "Your responsibility",
            "Use the service and exercise at your own risk, to the extent permitted by applicable law. Select appropriate loads, equipment and environment. Programming is independently authored draft content; it does not replace a qualified coach’s review or supervision.",
          ],
          [
            "Service availability",
            "We may modify, suspend or discontinue the service, features or accounts for safety, misuse or operational reasons. We do not guarantee uninterrupted service or particular training outcomes.",
          ],
          [
            "Data and acceptable use",
            "Provide accurate information, do not misuse the service or access other users’ data, and do not submit unlawful content. You can export or delete your account data from Profile.",
          ],
          [
            "Liability and legal rights",
            "To the extent permitted by law, the service is provided as available without guarantees. Nothing in these terms limits rights that cannot legally be excluded. No affiliation with a third-party fitness program is claimed.",
          ],
        ];
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link to="/">
        {t("← ")}
        {t(BRAND.name)}
      </Link>
      <h1 className="mt-8 text-5xl">
        {t(kind === "privacy" ? "Privacy Policy" : "Terms of Service")}
      </h1>
      <p className="mt-3 text-muted-foreground">{t("Effective October 17, 2026")}</p>
      {t(
        sections.map(([title, text]) => (
          <section key={title} className="mt-8">
            <h2 className="text-2xl">{t(title)}</h2>
            <p className="mt-3 leading-relaxed">{t(text)}</p>
          </section>
        )),
      )}
      <div className="mt-10 flex gap-5">
        <Link to="/privacy">{t("Privacy")}</Link>
        <Link to="/terms">{t("Terms")}</Link>
      </div>
    </main>
  );
}
