                        {serverSettingsTab === 'OVERVIEW' && (
                             <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
                                {/* Banner Section */}
                                <div className="relative mb-10">
                                    <div className="group rounded-xl overflow-hidden h-32 bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer hover:border-nexus-accent transition-colors relative" onClick={() => bannerInputRef.current?.click()}>
                                        {activeServer.banner ? (
                                            <img src={activeServer.banner} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-500 group-hover:text-nexus-accent">
                                                <ImageIcon size={32} className="mb-2" />
                                                <span className="text-xs font-bold uppercase">Upload Banner</span>
                                            </div>
                                        )}
                                        <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleServerBannerUpload} />
                                    </div>
                                    
                                    {/* Icon Overlay */}
                                    <div className="absolute -bottom-6 left-6 w-20 h-20 rounded-full border-4 border-slate-800 bg-slate-700 z-10 shadow-xl overflow-hidden group/icon cursor-pointer" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                                        <img src={activeServer.icon} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/icon:opacity-100 flex items-center justify-center transition-opacity">
                                            <Camera size={20} className="text-white" />
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleServerIconUpload} />
                                    </div>
                                </div>
                                
                                <div className="mt-8 grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <Input label="Server Name" value={activeServer.name} onChange={(e: any) => handleUpdateServer({ name: e.target.value })} />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Region</label>
                                        <div className="relative">
                                            <select 
                                                value={activeServer.region} 
                                                onChange={(e) => handleUpdateServer({ region: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-nexus-accent focus:outline-none appearance-none"
                                            >
                                            <option>US East</option>
                                            <option>US West</option>
                                            <option>EU West</option>
                                            <option>Asia</option>
                                            </select>
                                            <Globe size={14} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span>Operational</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 space-y-4">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><Settings size={14}/> Widget Settings</h4>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">System Messages Channel</label>
                                        <select 
                                            value={activeServer.systemChannelId || ''} 
                                            onChange={(e) => handleUpdateServer({ systemChannelId: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-nexus-accent focus:outline-none"
                                        >
                                            <option value="">No System Messages</option>
                                            {activeServer.channels.filter(c => c.type === 'TEXT').map(c => (
                                                <option key={c.id} value={c.id}>#{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">AFK Voice Channel</label>
                                        <select 
                                            value={activeServer.afkChannelId || ''} 
                                            onChange={(e) => handleUpdateServer({ afkChannelId: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-nexus-accent focus:outline-none"
                                        >
                                            <option value="">No AFK Channel</option>
                                            {activeServer.channels.filter(c => c.type === 'VOICE').map(c => (
                                                <option key={c.id} value={c.id}>🔊 {c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div>
                                            <div className="text-sm font-medium text-white">Default Notification Settings</div>
                                            <div className="text-xs text-slate-500">All messages vs mentions only</div>
                                        </div>
                                        <Switch checked={true} onChange={() => {}} />
                                    </div>
                                </div>

                                {/* Invite Link Widget */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Invite Link</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-nexus-glow font-mono flex items-center justify-between">
                                            <span>nexus.gg/{activeServer.id.slice(0,8)}</span>
                                            <button className="text-slate-500 hover:text-white" title="Copy"><Copy size={14}/></button>
                                        </div>
                                        <Button variant="secondary" className="text-xs">Regenerate</Button>
                                    </div>
                                </div>
                             </div>
                        )}