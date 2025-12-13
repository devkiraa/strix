import Link from "next/link";
import { ArrowLeftIcon, DocumentTextIcon } from "@heroicons/react/24/solid";

export default function TermsOfServicePage() {
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
                            <DocumentTextIcon className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">Terms of Service</h1>
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
                            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-300 leading-relaxed">
                                By accessing and using this website, you accept and agree to be bound by the terms and
                                provisions of this agreement. If you do not agree to these terms, please do not use our service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
                            <p className="text-gray-300 leading-relaxed">
                                This website provides a platform to discover movies and TV shows. We aggregate publicly
                                available information from third-party sources and provide links to external streaming services.
                                We do not host any video content on our servers.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. User Responsibilities</h2>
                            <p className="text-gray-300 leading-relaxed mb-4">
                                As a user of this service, you agree to:
                            </p>
                            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                                <li>Use the service only for lawful purposes</li>
                                <li>Not attempt to circumvent any security measures</li>
                                <li>Not use automated systems to access the service</li>
                                <li>Respect intellectual property rights</li>
                                <li>Not distribute or share content illegally</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. Intellectual Property</h2>
                            <p className="text-gray-300 leading-relaxed">
                                All movie and TV show information, including images and descriptions, are property of their
                                respective owners. We use this information under fair use for informational purposes.
                                Trademarks and logos are property of their respective owners.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">5. Third-Party Links</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Our service may contain links to third-party websites or services. We are not responsible
                                for the content, privacy policies, or practices of any third-party sites. Use these links
                                at your own risk.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">6. Disclaimer of Warranties</h2>
                            <p className="text-gray-300 leading-relaxed">
                                This service is provided &quot;as is&quot; without any warranties, expressed or implied. We do not
                                guarantee that the service will be uninterrupted, secure, or error-free. We are not
                                responsible for any damages arising from the use of this service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
                            <p className="text-gray-300 leading-relaxed">
                                In no event shall we be liable for any indirect, incidental, special, consequential, or
                                punitive damages arising out of or related to your use of the service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">8. Changes to Terms</h2>
                            <p className="text-gray-300 leading-relaxed">
                                We reserve the right to modify these terms at any time. Changes will be effective immediately
                                upon posting on this page. Your continued use of the service after changes constitutes
                                acceptance of the modified terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">9. Governing Law</h2>
                            <p className="text-gray-300 leading-relaxed">
                                These terms shall be governed by and construed in accordance with applicable laws,
                                without regard to conflict of law principles.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">10. Contact</h2>
                            <p className="text-gray-300 leading-relaxed">
                                For any questions regarding these Terms of Service, please contact us through our
                                request page or GitHub repository.
                            </p>
                        </section>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="mt-12 pt-8 border-t border-white/10">
                    <div className="flex flex-wrap gap-4 text-sm">
                        <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                            Privacy Policy
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
