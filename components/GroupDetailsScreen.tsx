
import React, { useState, useEffect } from 'react';
import type { Group } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ShareIcon } from './icons/ShareIcon';
import { TrashIcon } from './icons/TrashIcon';
import { BellSlashIcon } from './icons/BellSlashIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { CloseIcon } from './icons/CloseIcon';
import { CheckIcon } from './icons/CheckIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import {
  getGroup,
  getGroupMembers,
  updateGroup,
  addGroupMembers,
  removeGroupMember,
  changeGroupMemberRole,
  createGroupInviteLink,
  revokeGroupInviteLink,
  setGroupAnnouncement,
  getConversations,
  getConversationById,
  normalizeMediaUrl,
  type GroupData,
  type ConversationMember,
} from '../services/apiService';
import { isAuthenticated, getUserId } from '../services/tokenService';

interface GroupDetailsScreenProps {
  group: Group;
  onBack: () => void;
}

interface DirectContact {
  conversationId: number;
  displayName: string;
  avatarUrl: string;
}

const GroupDetailsScreen: React.FC<GroupDetailsScreenProps> = ({ group, onBack }) => {
  const convId = Number(group.id);
  const myId = getUserId();

  // Group data from API
  const [groupInfo, setGroupInfo] = useState<GroupData | null>(null);
  const [members, setMembers] = useState<(ConversationMember & { muted?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [activeModal, setActiveModal] = useState<'edit-name' | 'edit-desc' | 'announcement' | 'add-member' | 'invite-link' | 'member-action' | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [selectedMember, setSelectedMember] = useState<ConversationMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Add member state
  const [availableUsers, setAvailableUsers] = useState<DirectContact[]>([]);
  const [selectedNewMembers, setSelectedNewMembers] = useState<Set<number>>(new Set()); // stores conversationId
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // My role in group
  const myRole = members.find((m) => m.userId === myId)?.role || 'MEMBER';
  const isAdmin = myRole === 'ADMIN' || myRole === 'OWNER';

  // Fetch group info + members
  useEffect(() => {
    if (!isAuthenticated() || isNaN(convId)) return;
    setIsLoading(true);

    Promise.all([getGroup(convId), getGroupMembers(convId, 0, 100)])
      .then(([groupRes, membersRes]) => {
        if (groupRes.success) {
          setGroupInfo(groupRes.data);
          setEditName(groupRes.data.groupName);
          setEditDesc(groupRes.data.groupDescription || '');
          setAnnouncementText(groupRes.data.announcementText || '');
        }
        if (membersRes.success) {
          setMembers(membersRes.data.content || []);
        }
      })
      .catch((err) => console.warn('Failed to load group details:', err))
      .finally(() => setIsLoading(false));
  }, [convId]);

  // -- Handlers --

  const handleUpdateName = async () => {
    if (!editName.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const res = await updateGroup(convId, { groupName: editName.trim() });
      if (res.success) setGroupInfo(res.data);
      setActiveModal(null);
    } catch (err) {
      console.warn('Failed to update group name:', err);
    }
    setIsSaving(false);
  };

  const handleUpdateDesc = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const res = await updateGroup(convId, { groupDescription: editDesc.trim() });
      if (res.success) setGroupInfo(res.data);
      setActiveModal(null);
    } catch (err) {
      console.warn('Failed to update description:', err);
    }
    setIsSaving(false);
  };

  const handleSetAnnouncement = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const res = await setGroupAnnouncement(convId, announcementText.trim());
      if (res.success) setGroupInfo(res.data);
      setActiveModal(null);
    } catch (err) {
      console.warn('Failed to set announcement:', err);
    }
    setIsSaving(false);
  };

  const handleRemoveMember = async (userId: number) => {
    if (!window.confirm('Remove this member from the group?')) return;
    try {
      await removeGroupMember(convId, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      setActiveModal(null);
    } catch (err) {
      console.warn('Failed to remove member:', err);
    }
  };

  const handleChangeRole = async (userId: number, newRole: 'ADMIN' | 'MEMBER') => {
    try {
      await changeGroupMemberRole(convId, userId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m))
      );
      setActiveModal(null);
    } catch (err) {
      console.warn('Failed to change role:', err);
    }
  };

  const handleLeaveGroup = async () => {
    if (!myId || !window.confirm('Are you sure you want to leave this group?')) return;
    try {
      await removeGroupMember(convId, myId);
      onBack();
    } catch (err) {
      console.warn('Failed to leave group:', err);
    }
  };

  const handleGenerateInviteLink = async () => {
    try {
      const res = await createGroupInviteLink(convId);
      if (res.success && res.data) {
        setInviteLink(res.data.inviteLink || res.data.token || '');
      }
      setActiveModal('invite-link');
    } catch (err) {
      console.warn('Failed to generate invite link:', err);
    }
  };

  const handleRevokeInviteLink = async () => {
    try {
      await revokeGroupInviteLink(convId);
      setInviteLink('');
      setActiveModal(null);
    } catch (err) {
      console.warn('Failed to revoke invite link:', err);
    }
  };

  const handleToggleAdminOnly = async (field: 'onlyAdminsCanSend' | 'onlyAdminsCanEditInfo') => {
    if (!groupInfo) return;
    const newVal = !groupInfo[field];
    try {
      const res = await updateGroup(convId, { [field]: newVal });
      if (res.success) setGroupInfo(res.data);
    } catch (err) {
      console.warn('Failed to toggle setting:', err);
    }
  };

  // -- Add members flow --
  // Just call getConversations(), filter DIRECT, show them. Fast single API call.
  const openAddMember = async () => {
    setActiveModal('add-member');
    setSelectedNewMembers(new Set());
    setSearchQuery('');
    setIsLoadingUsers(true);

    try {
      const res = await getConversations();
      const directConvs = (res.data || [])
        .filter((c) => c.type === 'DIRECT')
        .map((c) => ({
          conversationId: c.conversationId,
          displayName: c.displayName || 'Unknown',
          avatarUrl: normalizeMediaUrl(c.avatarUrl) || `https://picsum.photos/seed/${c.conversationId}/80/80`,
        }));

      setAvailableUsers(directConvs);
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    }
    setIsLoadingUsers(false);
  };

  // On "Add" click: resolve userIds from selected conversations, then add to group
  const handleAddMembers = async () => {
    if (selectedNewMembers.size === 0 || isSaving) return;
    setIsSaving(true);
    try {
      // Resolve userId for each selected conversation
      const selectedConvIds = Array.from(selectedNewMembers);
      const userIds: number[] = [];

      await Promise.all(
        selectedConvIds.map(async (cId) => {
          try {
            const detail = await getConversationById(cId);
            if (detail.success && detail.data.members) {
              const other = detail.data.members.find((m) => m.userId !== myId) || detail.data.members[0];
              if (other) userIds.push(other.userId);
            }
          } catch (err) {
            console.warn(`Failed to resolve userId for conv ${cId}:`, err);
          }
        })
      );

      if (userIds.length > 0) {
        await addGroupMembers(convId, userIds);
        // Refresh members list
        const res = await getGroupMembers(convId, 0, 100);
        if (res.success) setMembers(res.data.content || []);
      }
      setActiveModal(null);
    } catch (err) {
      console.warn('Failed to add members:', err);
    }
    setIsSaving(false);
  };

  // -- Render Helpers --

  const getRoleBadge = (role: string) => {
    if (role === 'OWNER') return <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 uppercase tracking-widest">Owner</span>;
    if (role === 'ADMIN') return <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-400 uppercase tracking-widest">Admin</span>;
    return null;
  };

  const groupAvatar = normalizeMediaUrl(groupInfo?.groupAvatarUrl) || normalizeMediaUrl(group.avatarUrl);
  const groupName = groupInfo?.groupName || group.name;
  const memberCount = groupInfo?.currentMemberCount ?? members.length;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#0B0E14] text-white items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3F9BFF] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-sm font-bold">Loading group info...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0B0E14] text-white">
      {/* ── Modals ── */}

      {/* Edit Name Modal */}
      {activeModal === 'edit-name' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-[#1C1C2E] rounded-[2rem] p-8 w-80 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black mb-4">Edit Group Name</h3>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={50}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#3F9BFF]/50 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-3 rounded-2xl bg-white/5 font-bold text-sm hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={handleUpdateName} disabled={isSaving || !editName.trim()} className="flex-1 py-3 rounded-2xl bg-[#3F9BFF] font-bold text-sm hover:bg-blue-500 transition-all disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Description Modal */}
      {activeModal === 'edit-desc' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-[#1C1C2E] rounded-[2rem] p-8 w-80 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black mb-4">Group Description</h3>
            <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} maxLength={512} rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#3F9BFF]/50 mb-4 resize-none" placeholder="Add group description..." />
            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-3 rounded-2xl bg-white/5 font-bold text-sm hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={handleUpdateDesc} disabled={isSaving} className="flex-1 py-3 rounded-2xl bg-[#3F9BFF] font-bold text-sm hover:bg-blue-500 transition-all disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {activeModal === 'announcement' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-[#1C1C2E] rounded-[2rem] p-8 w-80 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black mb-2">Group Announcement</h3>
            <p className="text-xs text-gray-500 mb-4">All members will be notified</p>
            <textarea value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} maxLength={256} rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#3F9BFF]/50 mb-4 resize-none" placeholder="Type announcement..." />
            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-3 rounded-2xl bg-white/5 font-bold text-sm hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={handleSetAnnouncement} disabled={isSaving} className="flex-1 py-3 rounded-2xl bg-[#3F9BFF] font-bold text-sm hover:bg-blue-500 transition-all disabled:opacity-50">{announcementText.trim() ? 'Set' : 'Clear'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Link Modal */}
      {activeModal === 'invite-link' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-[#1C1C2E] rounded-[2rem] p-8 w-80 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black mb-4">Invite Link</h3>
            {inviteLink ? (
              <>
                <div className="bg-white/5 rounded-2xl px-4 py-3 text-sm text-[#3F9BFF] break-all mb-4 border border-white/10">{inviteLink}</div>
                <div className="flex gap-3">
                  <button onClick={() => { navigator.clipboard.writeText(inviteLink); }} className="flex-1 py-3 rounded-2xl bg-[#3F9BFF] font-bold text-sm hover:bg-blue-500 transition-all">Copy</button>
                  <button onClick={handleRevokeInviteLink} className="flex-1 py-3 rounded-2xl bg-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/30 transition-all">Revoke</button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm mb-4">No active invite link</p>
            )}
            <button onClick={() => setActiveModal(null)} className="w-full mt-3 py-3 rounded-2xl bg-white/5 font-bold text-sm hover:bg-white/10 transition-all">Close</button>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {activeModal === 'add-member' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col backdrop-blur-sm">
          <div className="bg-[#0B0E14] flex-1 flex flex-col max-h-full">
            <header className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
              <button onClick={() => setActiveModal(null)} className="p-2 rounded-full hover:bg-white/10"><CloseIcon className="w-5 h-5" /></button>
              <h3 className="font-black text-lg">Add Members</h3>
              <button onClick={handleAddMembers} disabled={selectedNewMembers.size === 0 || isSaving}
                className={`font-bold text-sm px-4 py-2 rounded-xl transition-all ${selectedNewMembers.size > 0 ? 'bg-[#3F9BFF] hover:bg-blue-500' : 'text-gray-600'}`}>
                Add ({selectedNewMembers.size})
              </button>
            </header>

            <div className="p-4 shrink-0">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..."
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3F9BFF]/30" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {isLoadingUsers && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-[#3F9BFF] border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-sm text-gray-500">Loading...</span>
                </div>
              )}

              {!isLoadingUsers && availableUsers
                .filter((u) => u.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((user) => {
                  const isSelected = selectedNewMembers.has(user.conversationId);
                  return (
                    <div key={user.conversationId}
                      onClick={() => {
                        setSelectedNewMembers((prev) => {
                          const next = new Set(prev);
                          if (next.has(user.conversationId)) next.delete(user.conversationId);
                          else next.add(user.conversationId);
                          return next;
                        });
                      }}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all">
                      <div className="relative">
                        <img src={user.avatarUrl} alt={user.displayName} className="w-12 h-12 rounded-full object-cover" />
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#3F9BFF] rounded-full flex items-center justify-center border-2 border-[#0B0E14]">
                            <CheckIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="font-semibold flex-1">{user.displayName}</p>
                    </div>
                  );
                })}

              {!isLoadingUsers && availableUsers.length === 0 && (
                <p className="text-center text-gray-600 py-12 text-sm font-bold">No contacts available to add</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Member Action Modal */}
      {activeModal === 'member-action' && selectedMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-[#1C1C2E] rounded-t-[2rem] w-full max-w-md p-6 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-6"></div>
            <div className="flex items-center gap-4 mb-6">
              <img src={normalizeMediaUrl(selectedMember.avatarUrl) || `https://picsum.photos/seed/${selectedMember.userId}/80/80`} alt="" className="w-14 h-14 rounded-full object-cover" />
              <div>
                <p className="font-black text-lg">{selectedMember.displayName}</p>
                <div className="mt-1">{getRoleBadge(selectedMember.role)}</div>
              </div>
            </div>

            <div className="space-y-2">
              {/* Promote/Demote */}
              {myRole === 'OWNER' && selectedMember.userId !== myId && (
                <button
                  onClick={() => handleChangeRole(selectedMember.userId, selectedMember.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-indigo-500/10 transition-all active:scale-[0.98]">
                  <ShieldCheckIcon className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-sm">{selectedMember.role === 'ADMIN' ? 'Dismiss as admin' : 'Make group admin'}</span>
                </button>
              )}

              {/* Remove */}
              {isAdmin && selectedMember.userId !== myId && selectedMember.role !== 'OWNER' && (
                <button
                  onClick={() => handleRemoveMember(selectedMember.userId)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-red-500/10 transition-all active:scale-[0.98]">
                  <TrashIcon className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-sm text-red-400">Remove from group</span>
                </button>
              )}
            </div>

            <button onClick={() => setActiveModal(null)} className="w-full mt-4 py-3 rounded-2xl bg-white/5 font-bold text-sm hover:bg-white/10 transition-all">Cancel</button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="flex items-center justify-between p-6 bg-gradient-to-b from-[#0B0E14] to-transparent z-10 shrink-0">
        <button onClick={onBack} className="p-3 bg-white/5 backdrop-blur-md rounded-2xl hover:bg-white/10 transition-all active:scale-90">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Group Info</p>
        <div className="w-11"></div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
        {/* Group Avatar + Name */}
        <div className="flex flex-col items-center p-8 pt-0 text-center">
          <div className="relative mb-6">
            <img src={groupAvatar} alt={groupName} className="w-32 h-32 rounded-[2.5rem] border-2 border-[#3F9BFF] object-cover shadow-2xl" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">{groupName}</h1>
          <p className="text-gray-500 text-sm font-bold mb-2">Group · {memberCount} members</p>
          {groupInfo?.groupDescription && (
            <p className="text-gray-400 text-sm max-w-[250px]">{groupInfo.groupDescription}</p>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Announcement Banner */}
          {groupInfo?.announcementText && (
            <div className="bg-indigo-500/10 rounded-[2rem] p-5 border border-indigo-500/20">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Announcement</p>
              <p className="text-sm text-white">{groupInfo.announcementText}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {isAdmin && (
              <button onClick={() => setActiveModal('edit-name')} className="flex flex-col items-center gap-3 p-5 bg-white/5 rounded-3xl hover:bg-[#3F9BFF]/10 transition-all active:scale-95 border border-transparent hover:border-[#3F9BFF]/30">
                <PencilIcon className="w-6 h-6 text-[#3F9BFF]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>
              </button>
            )}
            <button onClick={handleGenerateInviteLink} className="flex flex-col items-center gap-3 p-5 bg-white/5 rounded-3xl hover:bg-green-500/10 transition-all active:scale-95 border border-transparent hover:border-green-500/30">
              <ShareIcon className="w-6 h-6 text-green-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Invite</span>
            </button>
            {isAdmin && (
              <button onClick={() => setActiveModal('announcement')} className="flex flex-col items-center gap-3 p-5 bg-white/5 rounded-3xl hover:bg-amber-500/10 transition-all active:scale-95 border border-transparent hover:border-amber-500/30">
                <BellSlashIcon className="w-6 h-6 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Announce</span>
              </button>
            )}
          </div>

          {/* Group Settings (Admin only) */}
          {isAdmin && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Group Settings</h3>
              <div className="bg-[#111827] rounded-[2rem] overflow-hidden border border-white/5 shadow-sm">
                <button onClick={() => setActiveModal('edit-desc')} className="w-full flex justify-between items-center p-5 hover:bg-white/5 transition-colors border-b border-white/5">
                  <span className="text-sm font-bold">Description</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs truncate max-w-[150px]">{groupInfo?.groupDescription || 'Add...'}</span>
                    <ChevronRightIcon className="w-4 h-4 text-gray-700" />
                  </div>
                </button>

                <div className="w-full flex justify-between items-center p-5 border-b border-white/5">
                  <div>
                    <p className="text-sm font-bold">Only admins can send</p>
                    <p className="text-[10px] text-gray-500">Restrict messaging to admins</p>
                  </div>
                  <button role="switch" aria-checked={groupInfo?.onlyAdminsCanSend}
                    onClick={() => handleToggleAdminOnly('onlyAdminsCanSend')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${groupInfo?.onlyAdminsCanSend ? 'bg-[#3F9BFF]' : 'bg-gray-700'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${groupInfo?.onlyAdminsCanSend ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="w-full flex justify-between items-center p-5">
                  <div>
                    <p className="text-sm font-bold">Only admins can edit</p>
                    <p className="text-[10px] text-gray-500">Restrict group info editing</p>
                  </div>
                  <button role="switch" aria-checked={groupInfo?.onlyAdminsCanEditInfo}
                    onClick={() => handleToggleAdminOnly('onlyAdminsCanEditInfo')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${groupInfo?.onlyAdminsCanEditInfo ? 'bg-[#3F9BFF]' : 'bg-gray-700'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${groupInfo?.onlyAdminsCanEditInfo ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Members Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between ml-2 mr-2">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{memberCount} Members</h3>
            </div>

            <div className="bg-[#111827] rounded-[2rem] overflow-hidden border border-white/5 shadow-sm">
              {/* Add Member button */}
              {isAdmin && (
                <button onClick={openAddMember}
                  className="w-full flex items-center gap-4 p-5 hover:bg-white/5 transition-colors border-b border-white/5">
                  <div className="w-10 h-10 bg-[#3F9BFF] rounded-full flex items-center justify-center">
                    <UserPlusIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-[#3F9BFF]">Add member</span>
                </button>
              )}

              {/* Invite link button */}
              <button onClick={handleGenerateInviteLink}
                className="w-full flex items-center gap-4 p-5 hover:bg-white/5 transition-colors border-b border-white/5">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <ShareIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold text-green-400">Invite via link</span>
              </button>

              {/* Member list */}
              {members.map((member, idx) => {
                const isMe = member.userId === myId;
                return (
                  <button key={member.userId}
                    onClick={() => {
                      if (!isMe && isAdmin) {
                        setSelectedMember(member);
                        setActiveModal('member-action');
                      }
                    }}
                    className={`w-full flex items-center gap-4 p-5 hover:bg-white/5 transition-colors ${idx < members.length - 1 ? 'border-b border-white/5' : ''}`}>
                    <img
                      src={normalizeMediaUrl(member.avatarUrl) || `https://picsum.photos/seed/${member.userId}/80/80`}
                      alt={member.displayName}
                      className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold">{member.displayName}{isMe && <span className="text-gray-500 ml-1">~ You</span>}</p>
                    </div>
                    {getRoleBadge(member.role)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leave Group */}
          <div className="pt-2">
            <button onClick={handleLeaveGroup}
              className="w-full p-5 bg-red-500/10 rounded-[2rem] text-red-500 font-black text-xs uppercase tracking-[0.2em] border border-red-500/20 hover:bg-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-3">
              <LogoutIcon className="w-5 h-5" />
              <span>Exit Group</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GroupDetailsScreen;
