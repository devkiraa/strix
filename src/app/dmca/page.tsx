import Link from "next/link";
import { ArrowLeftIcon, ScaleIcon } from "@heroicons/react/24/solid";

export default function DMCAPage() {
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
                            <ScaleIcon className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">DMCA Policy</h1>
                            <p className="text-gray-400 mt-1">Digital Millennium Copyright Act</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="prose prose-invert prose-gray max-w-none">
                    <div className="space-y-8">
                        {/* Important Notice */}
                        <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-6">
                            <h3 className="text-red-400 font-semibold mb-2">Important Notice</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                This website does not host any video content. We are a discovery platform that provides
                                information about movies and TV shows, with links to third-party streaming services.
                                All content is hosted by external providers.
                            </p>
                        </div>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. Copyright Compliance</h2>
                            <p className="text-gray-300 leading-relaxed">
                                We respect the intellectual property rights of others and expect our users to do the same.
                                We comply with the Digital Millennium Copyright Act (DMCA) and respond promptly to notices
                                of alleged copyright infringement.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. Our Role</h2>
                            <p className="text-gray-300 leading-relaxed">
                                As a discovery and information platform:
                            </p>
                            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-4">
                                <li>We do not host any video or audio content</li>
                                <li>We aggregate publicly available metadata from TMDB</li>
                                <li>We provide links to third-party streaming services</li>
                                <li>All streaming is handled by external providers</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. Filing a DMCA Notice</h2>
                            <p className="text-gray-300 leading-relaxed mb-4">
                                If you believe that content accessible through our links infringes your copyright,
                                please provide the following information:
                            </p>
                            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                                <li>Your physical or electronic signature</li>
                                <li>Identification of the copyrighted work claimed to be infringed</li>
                                <li>Identification of the material claimed to be infringing</li>
                                <li>Your contact information (address, phone, email)</li>
                                <li>A statement of good faith belief that use is not authorized</li>
                                <li>A statement that the information is accurate under penalty of perjury</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. Counter-Notification</h2>
                            <p className="text-gray-300 leading-relaxed">
                                If you believe your content was wrongly removed, you may submit a counter-notification
                                including your contact information, identification of the removed material, a statement
                                under penalty of perjury that you have a good faith belief that the material was removed
                                by mistake, and consent to jurisdiction.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">5. Repeat Infringers</h2>
                            <p className="text-gray-300 leading-relaxed">
                                We will terminate access for users who are repeat infringers in appropriate circumstances.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">6. Contact for DMCA Notices</h2>
                            <p className="text-gray-300 leading-relaxed mb-4">
                                DMCA notices and counter-notifications should be sent to:
                            </p>
                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <p className="text-gray-300">
                                    Please contact us through our GitHub repository for DMCA-related matters.
                                    We will respond to valid notices within 24-48 hours.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">7. Third-Party Content</h2>
                            <p className="text-gray-300 leading-relaxed">
                                For content hosted by third-party services, we recommend contacting those services directly.
                                We can assist by removing links to infringing content upon receiving a valid DMCA notice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">8. Good Faith</h2>
                            <p className="text-gray-300 leading-relaxed">
                                We act in good faith to address copyright concerns promptly. Misrepresentation of infringement
                                claims may result in liability for damages, including costs and attorneys&apos; fees.
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
                        <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
