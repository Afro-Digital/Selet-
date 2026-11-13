'use client';

import React, { useState } from 'react';
import { UserRole, Person, Role, RateCard } from '../types';
import { Locale, translations } from '../lib/i18n';
import { INITIAL_PEOPLE, INITIAL_ROLES, INITIAL_RATE_CARDS } from '../lib/mock-data';
import { formatCurrencyMinor } from '../lib/person-cost';
import { PeopleTable } from '../components/people/PeopleTable';
import { AddPersonModal } from '../components/people/AddPersonModal';
import { RolesList } from '../components/roles/RolesList';
import { RateCardsList } from '../components/rate-cards/RateCardsList';
import {
  Users,
  Briefcase,
  CreditCard,
  Languages,
  Shield,
  Clock,
  Coins,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function Home() {
  const [locale, setLocale] = useState<Locale>('en');
  const [userRole, setUserRole] = useState<UserRole>('OWNER');
  const [activeTab, setActiveTab] = useState<'people' | 'roles' | 'rate-cards'>('people');

  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [rateCards, setRateCards] = useState<RateCard[]>(INITIAL_RATE_CARDS);
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);

  const t = translations[locale];
  const isOwner = userRole === 'OWNER';

  // Metrics
  const totalProductiveHours = people.reduce(
    (sum, p) => sum + (p.computedHourlyCost?.productiveHoursPerMonth || 0),
    0,
  );

  const totalMonthlyCostMinor = people.reduce(
    (acc, p) => acc + BigInt(p.computedHourlyCost?.totalMonthlyCostMinor || '0'),
    0n,
  );

  const blendedHourlyCostMinor =
    totalProductiveHours > 0
      ? (totalMonthlyCostMinor / BigInt(totalProductiveHours)).toString()
      : '0';

  const defaultCard = rateCards.find((rc) => rc.isDefault) || rateCards[0];

  // Actions
  const handleUpdatePerson = (updated: Person) => {
    setPeople((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePerson = (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddPerson = (newPerson: Person) => {
    setPeople((prev) => [newPerson, ...prev]);
  };

  const handleAddRole = (newRole: Role) => {
    setRoles((prev) => [...prev, newRole]);
  };

  const handleAddRateCard = (newCard: RateCard) => {
    setRateCards((prev) => [...prev, newCard]);
  };

  const handleSetDefaultRateCard = (id: string) => {
    setRateCards((prev) =>
      prev.map((rc) => ({
        ...rc,
        isDefault: rc.id === id,
      })),
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
              ስ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Selet (ስሌት)
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  v0.1.0 Stage 5
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">{t.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <button
                onClick={() => setLocale('en')}
                className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-all ${
                  locale === 'en'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('am')}
                className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-all ${
                  locale === 'am'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                አማርኛ
              </button>
            </div>

            {/* Role Simulator Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-2.5 py-1 border border-slate-200 text-xs">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 hidden md:inline">{t.simulatedRole}:</span>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="bg-transparent font-semibold text-slate-800 text-xs focus:outline-none cursor-pointer"
              >
                <option value="OWNER">{t.roleOwner}</option>
                <option value="PM">{t.rolePm}</option>
                <option value="DEVELOPER">{t.roleDeveloper}</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Team Members */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">{t.teamMembers}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{people.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {people.filter((p) => p.isEthiopianNational).length} with 11% POESSA
              </p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Productive Hours */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">{t.productiveHours}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalProductiveHours} hrs</p>
              <p className="text-xs text-slate-400 mt-0.5">Based on utilization rates</p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Blended Hourly Cost (Owner Only) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                {locale === 'am' ? 'አማካይ የሰዓት ወጪ' : 'Blended Hourly Cost'}
              </p>
              {isOwner ? (
                <>
                  <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                    {formatCurrencyMinor(blendedHourlyCostMinor, 'ETB')}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Weighted team labor floor</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-400 mt-2 flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    <span>{t.confidentialHidden}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Owner account required</p>
                </>
              )}
            </div>
            <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Default Billing Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">{t.defaultCard}</p>
              <p className="text-sm font-bold text-slate-900 mt-1 truncate max-w-[150px]">
                {defaultCard?.name || 'Standard'}
              </p>
              <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active for new quotes</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('people')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'people'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.teamMembers}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {people.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'roles'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{t.jobRoles}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {roles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rate-cards')}
            className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'rate-cards'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{t.rateCards}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {rateCards.length}
            </span>
          </button>
        </div>

        {/* Active Tab Views */}
        {activeTab === 'people' && (
          <PeopleTable
            people={people}
            roles={roles}
            userRole={userRole}
            locale={locale}
            onUpdatePerson={handleUpdatePerson}
            onDeletePerson={handleDeletePerson}
            onOpenAddModal={() => setIsAddPersonModalOpen(true)}
          />
        )}

        {activeTab === 'roles' && (
          <RolesList roles={roles} userRole={userRole} locale={locale} onAddRole={handleAddRole} />
        )}

        {activeTab === 'rate-cards' && (
          <RateCardsList
            rateCards={rateCards}
            roles={roles}
            userRole={userRole}
            locale={locale}
            onAddRateCard={handleAddRateCard}
            onSetDefault={handleSetDefaultRateCard}
          />
        )}
      </div>

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={isAddPersonModalOpen}
        onClose={() => setIsAddPersonModalOpen(false)}
        roles={roles}
        locale={locale}
        onAddPerson={handleAddPerson}
      />
    </main>
  );
}
