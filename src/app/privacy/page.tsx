import Link from "next/link";
import { ArrowLeftIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#141414]">
            {/* Header */}
            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#141414] pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center">
                            <ShieldCheckIcon className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
                            <p className="text-gray-400 mt-1">Last updated: December 2024</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="prose prose-invert prose-gray max-w-none">
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Welcome to our streaming platform. We respect your privacy and are committed to protecting
                                your personal data. This privacy policy explains how we collect, use, and safeguard your
                                information when you visit our website.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
                            <p className="text-gray-300 leading-relaxed mb-4">
                                We may collect and process the following types of information:
                            </p>
                            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                                <li>Browser type and version</li>
                                <li>Device information</li>
                                <li>IP address</li>
                                <li>Pages visited and time spent</li>
                                <li>Viewing preferences (stored locally)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
                            <p className="text-gray-300 leading-relaxed mb-4">
                                We use the collected information for the following purposes:
                            </p>
                            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                                <li>To provide and maintain our service</li>
                                <li>To improve user experience</li>
                                <li>To analyze usage patterns</li>
                                <li>To remember your preferences</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. Local Storage</h2>
                            <p className="text-gray-300 leading-relaxed">
                                We use local storage to save your viewing progress and preferences. This data is stored
                                only on your device and is not transmitted to our servers. You can clear this data at
                                any time through your browser settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">5. Third-Party Services</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Our website uses third-party services for content delivery. These services may have their
                                own privacy policies governing the use of your information. We recommend reviewing their
                                privacy policies as well.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">6. Data Security</h2>
                            <p className="text-gray-300 leading-relaxed">
                                We implement appropriate security measures to protect your information. However, no method
                                of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">7. Your Rights</h2>
                            <p className="text-gray-300 leading-relaxed">
                                You have the right to access, correct, or delete your personal data. Since we primarily
                                use local storage, you can manage most of your data directly through your browser.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">8. Contact Us</h2>
                            <p className="text-gray-300 leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us through our
                                request page or GitHub repository.
                            </p>
                        </section>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="mt-12 pt-8 border-t border-white/10">
                    <div className="flex flex-wrap gap-4 text-sm">
                        <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/dmca" className="text-gray-400 hover:text-white transition-colors">
                            DMCA
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
